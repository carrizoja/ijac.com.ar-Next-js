# Chatbot operations runbook

Operational procedures for the Stage 2 grounded chatbot. For the API contract, environment
reference and request precedence, see [`../chat-api/README.md`](../chat-api/README.md).

## Topology

Two deployables that are released, rolled back and disabled **independently**.

| Deployable | Host | Contains | Release |
|---|---|---|---|
| Website | Hostinger, static `out/` | `AIChat.tsx`, deterministic engine, API client | `npm run build`, upload contents of `out/` to `public_html/` |
| Chat API | Vercel, `api.ijac.com.ar` | Retrieval, provider, controls, secrets | Vercel project rooted at `chat-api/` |

The website never holds a secret and never imports from `chat-api/`. Either side can be turned
off without touching the other.

## First-time setup

Do these in order. The API stays disabled until the last step, so a half-configured deployment
cannot serve traffic.

Every step below is also a release gate requiring an owner approval or an account. See
[`chatbot-release-gates.md`](./chatbot-release-gates.md) for the full list, current status, and
the sign-off table.

### 1. DNS for `api.ijac.com.ar`

Add the domain to the Vercel project first, then create the CNAME it asks for. Adding it first
matters: **the target is unique per project**, so it has to be read rather than remembered.

```bash
vercel domains add api.ijac.com.ar ijac-chat-api
vercel domains verify api.ijac.com.ar          # prints recommended.records
```

That returns the record to create at the DNS provider — currently Hostinger, since the
nameservers are `ns1`/`ns2.dns-parking.com`:

```
Type   Name   Value
CNAME  api    <the value verify returned, e.g. 9441a58f124c245b.vercel-dns-017.com.>
```

The name field is relative, so it is `api`, not `api.ijac.com.ar`. Leave the apex A records
alone — they point at the website on Hostinger and have nothing to do with this.

Then verify, and issue the certificate if it has not appeared:

```bash
dig +short api.ijac.com.ar                     # expect the CNAME chain, then Vercel IPs
vercel domains verify api.ijac.com.ar          # expect "configured-correctly"
vercel certs ls | grep api.ijac.com.ar         # if absent, issue it explicitly:
vercel certs issue api.ijac.com.ar
curl -sI https://api.ijac.com.ar/v1/chat | head -1
```

Automatic issuance is not guaranteed to fire promptly. Until a certificate exists the domain
answers plain HTTP correctly while HTTPS fails at the TLS handshake — a failure that looks like
broken DNS and is not.

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

Create an Upstash Redis database (or any store speaking the same REST protocol) and set
`CHAT_API_KV_URL` and `CHAT_API_KV_TOKEN`. The client is `chat-api/kv/upstash.ts`; it needs only
`get`, `incr` and `expire`.

Verify after enabling: a request creates `chat-api:quota:global` in the store, and exhausting a
client quota returns `RATE_LIMITED` (429).

If the store is unreachable or the token is wrong, the gate fails closed with
`PROVIDER_UNAVAILABLE` rather than serving unmetered traffic — so a misconfiguration here shows
up as an outage, never as an unmetered API.

### 5. Deploy the API

Create a Vercel project with the **root directory set to `chat-api`**. `chat-api/vercel.json`
rewrites the public `/v1/chat` path onto the `api/chat` function, which builds the app once per
cold start.

An empty `503` on every path means configuration failed to load; check the environment against
`chat-api/README.md`.

### 6. Enable

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
