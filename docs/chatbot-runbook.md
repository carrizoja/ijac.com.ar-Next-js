# Chatbot operations runbook

Operational procedures for the Stage 2 grounded chatbot. For the API contract, environment
reference and request precedence, see [`../chat-api/README.md`](../chat-api/README.md).

## Topology

Two deployables that are released, rolled back and disabled **independently**.

| Deployable | Host | Contains | Release |
|---|---|---|---|
| Website | Hostinger, static `out/` | `AIChat.tsx`, deterministic engine, API client | `npm run build`, upload contents of `out/` to `public_html/` |
| Chat API | Vercel, `api.ijac.com.ar` | Retrieval, provider, controls, secrets | Vercel deployment |

The website never holds a secret and never imports from `chat-api/`. Either side can be turned
off without touching the other.

## First-time setup

Do these in order. The API stays disabled until the last step, so a half-configured deployment
cannot serve traffic.

Every step below is also a release gate requiring an owner approval or an account. See
[`chatbot-release-gates.md`](./chatbot-release-gates.md) for the full list, current status, and
the sign-off table.

### 1. DNS for `api.ijac.com.ar`

Add a CNAME at your DNS provider pointing the `api` subdomain at Vercel, then add the domain in
the Vercel project so a certificate is issued.

```
Type   Name   Value
CNAME  api    cname.vercel-dns.com.
```

Verify before continuing:

```bash
dig +short api.ijac.com.ar
curl -sI https://api.ijac.com.ar | head -1     # expect an HTTP response, any status
```

### 2. Environment variables

Set every variable from the table in `chat-api/README.md` on the Vercel project. Leave
`CHAT_API_ENABLED` unset for now.

`CHAT_API_CLIENT_KEY_SECRET` must be random and secret — it is the HMAC key that keeps caller
addresses out of the quota store:

```bash
openssl rand -hex 32
```

### 3. Allowed origins, including previews

`CHAT_API_ALLOWED_ORIGINS` takes **exact** origins only. Wildcards are rejected at config load,
deliberately — `https://*.vercel.app` would let any preview deployment on the platform call your
API and spend your Groq quota.

Production:

```
https://ijac.com.ar,https://www.ijac.com.ar
```

To test a preview build, append that one deployment's exact origin and remove it afterwards:

```
https://ijac.com.ar,https://www.ijac.com.ar,https://ijac-next-app-abc123.vercel.app
```

### 4. Provision the KV store

**Not yet implemented.** See "Not yet implemented" in `chat-api/README.md`. Until a `KvClient`
is bound, the gate fails closed with `PROVIDER_UNAVAILABLE` and the API will not serve answers.

### 5. Enable

Set `CHAT_API_ENABLED=true` on the API, then build and deploy the website with
`NEXT_PUBLIC_CHAT_AI_ENABLED=true` and `NEXT_PUBLIC_CHAT_API_URL=https://api.ijac.com.ar`.

## Kill switch

Immediate stop, no redeploy, no build. Set the KV key:

```
chat-api:kill-switch = 1
```

Any value present disables the API. The gate checks it before consuming quota, so a kill switch
does not burn a visitor's allowance. Every request then returns `DISABLED` (HTTP 503) and the
widget shows the localized handoff card. Delete the key to resume.

Use this for a suspected prompt-injection incident, a Groq billing surprise, or unapproved
content appearing in answers.

## Quotas

Fixed windows, both enforced before any provider call.

| Key | Purpose |
|---|---|
| `chat-api:quota:global` | All callers, per window. Protects the Groq free tier. |
| `chat-api:quota:client:<hmac>` | One caller, per window. The suffix is an HMAC of the address; the address itself is never stored. |

The window TTL is applied when a counter is created. To reset early, delete the keys.

Raising `CHAT_API_GLOBAL_QUOTA` is the lever if legitimate traffic is being turned away;
lowering it is the lever if the free tier is being consumed too fast. Both take effect on the
next deployment.

## Rollback

Pick the smallest one that addresses the problem.

| Situation | Action | Effect | Redeploy? |
|---|---|---|---|
| Bad answers, urgent | Set `chat-api:kill-switch` | All requests `DISABLED`; widget hands off | No |
| API misbehaving | `CHAT_API_ENABLED=false` | Same, but survives KV loss | API only |
| Bad API release | Roll back the Vercel deployment | Previous API version | API only |
| Take AI out of the site entirely | Unset `NEXT_PUBLIC_CHAT_AI_ENABLED`, rebuild, redeploy `out/` | Deterministic-only chatbot | Website only |

The last row is the full Stage 1 restoration: with the flag off, `AIChat` builds no client, the
API is never called, and every answer comes from `chatEngine.ts` — which Stage 2 never modified.

Rolling back the website does **not** require touching the API, and vice versa.

## Smoke evidence after a release

Run these against production and keep the output with the release record.

```bash
# 1. Preflight from an allowed origin — expect 204
curl -si -X OPTIONS https://api.ijac.com.ar/v1/chat \
  -H 'Origin: https://ijac.com.ar' | head -1

# 2. Disallowed origin — expect 403, and no answer
curl -s -X POST https://api.ijac.com.ar/v1/chat \
  -H 'Origin: https://evil.example' -H 'Content-Type: application/json' \
  -d '{"apiVersion":"v1","question":"test","language":"es"}'

# 3. Extra field — expect INVALID_REQUEST, rejected before any provider call
curl -s -X POST https://api.ijac.com.ar/v1/chat \
  -H 'Origin: https://ijac.com.ar' -H 'Content-Type: application/json' \
  -d '{"apiVersion":"v1","question":"test","language":"es","transcript":[]}'

# 4. Off-script question — expect UNKNOWN with no answer field
curl -s -X POST https://api.ijac.com.ar/v1/chat \
  -H 'Origin: https://ijac.com.ar' -H 'Content-Type: application/json' \
  -d '{"apiVersion":"v1","question":"Who won the 1998 World Cup?","language":"es"}'

# 5. Approved question in each language — expect SUCCESS with sources
for L in es en pt; do
  curl -s -X POST https://api.ijac.com.ar/v1/chat \
    -H 'Origin: https://ijac.com.ar' -H 'Content-Type: application/json' \
    -d "{\"apiVersion\":\"v1\",\"question\":\"What is managed IT support?\",\"language\":\"$L\"}"
done
```

Checklist:

- [ ] Preflight returns 204 with the exact origin echoed, never `*`
- [ ] Disallowed origin returns 403 and no `answer`
- [ ] Extra request field is rejected
- [ ] Off-script question returns `UNKNOWN` and the widget shows the handoff card
- [ ] All three languages return `SUCCESS` citing only approved `ijac.com.ar` sources
- [ ] Kill switch flips every response to `DISABLED`, then removing it restores service
- [ ] Vercel logs contain no prompt, answer, or raw IP address
- [ ] Deployed `out/` contains no `groq`, `gsk-`, or server symbol:
      `grep -rl "groq\|gsk-\|handleChatRequest" out/` returns nothing
- [ ] With `NEXT_PUBLIC_CHAT_AI_ENABLED` unset, the widget answers deterministically and issues
      no network request

## Incident: unapproved content in an answer

1. Set `chat-api:kill-switch` immediately.
2. Capture the question and the rendered answer from the reporter — they are not in any log,
   by design.
3. Add the case as a failing fixture in `chat-api/validation.test.ts`.
4. Fix `validation.ts` until it fails closed, then release the API.
5. Remove the kill switch and re-run the smoke checks.

Do not respond by loosening validation or by adding the claim to the knowledge base without the
content owner's approval.

## Knowledge base changes

Entries in `packages/knowledge/fixtures/` carry `approvedAt`, `reviewedAt` and `reapprovalDueAt`.
Retrieval drops anything not `approved`, so an unapproved edit removes an entry from service
rather than publishing it. Public-content changes require the owner to re-approve before the
entry becomes eligible again.
