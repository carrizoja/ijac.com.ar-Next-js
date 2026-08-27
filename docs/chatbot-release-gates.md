# Chatbot release gates

These gates block **release**, not local implementation. Every one of them requires an account,
a credential, a DNS record, or a human approval that cannot be produced from the codebase.

The implementation is complete and verified without any of them: 377 tests, typecheck, lint and
the static build all pass with no credentials, because every test uses a fake transport and an
in-memory KV double.

**Live Groq calls and production infrastructure stay out of ordinary CI.** No test may consume a
real API quota, reach `api.ijac.com.ar`, or touch a real KV store. If a future change makes CI
depend on a live provider, that change is wrong.

Runbook: [`chatbot-runbook.md`](./chatbot-runbook.md). API reference:
[`../chat-api/README.md`](../chat-api/README.md).

## Status

| # | Gate | Owner | Status |
|---|---|---|---|
| 1 | Knowledge base approval | Content owner | ✅ Met — 8 services approved 2026-08-27 |
| 2 | Localized copy approval | Content owner | ❌ Not met |
| 3 | Groq account, privacy terms, model choice | Account owner | ❌ Not met |
| 4 | KV store account and quota | Account owner | ❌ Not met — client implemented, account still required |
| 5 | DNS for `api.ijac.com.ar` | Domain owner | ❌ Not met |
| 6 | Preview smoke evidence | Release owner | ❌ Blocked by 1–5 |
| 7 | Secret and log inspection in production | Release owner | ⚠️ Repo clean; production unverifiable until deployed |

Nothing ships until every row is met. Until then the website runs deterministically, which is
its current production behaviour and is unaffected.

---

## 1. Knowledge base approval

**Met on 2026-08-27.** `packages/knowledge/fixtures/services.ts` holds 8 approved entries, one
per service published on the site, owned by José Carrizo and due for reapproval on 2027-08-27.
The former single-entry placeholder (`fixtures/v1.ts`, `owner: "content-owner"`,
`reapprovalDueAt: "2099-01-01"`) has been deleted — its far-future date disabled the freshness
check and it must never have shipped.

Every claim was reviewed against the published copy entry by entry. Seven of the eight had a
coverage gap that was closed during review; the two that mattered commercially were SEO and
ongoing maintenance under `desarrollo-web-apps`, both sold in the site copy but absent from the
claims, and both of which would have handed off to WhatsApp.

Retrieval coverage is pinned by tests: eight realistic questions across Spanish, English and
Portuguese each resolve to the expected entry, and an off-topic question still returns nothing.

**Re-verify when content changes:** every entry must keep `status: "approved"`, a named owner,
and a `reviewedAt` within your cadence. Retrieval silently drops anything not approved, so an
unapproved edit removes an entry from service rather than publishing it. Changing an entry's
meaning rather than its wording requires a new `id`.

## 2. Localized copy approval

**Blocked because:** the handoff card wording is contractual and appears verbatim to visitors in
three languages. It lives in `UNKNOWN_COPY` in `src/app/components/chat/hybridChat.ts`:

- ES — "No encontré información aprobada para responder con seguridad. Escríbenos por WhatsApp."
- EN — "I could not find approved information to answer safely. Contact us on WhatsApp."
- PT — "Não encontrei informação aprovada para responder com segurança. Fale conosco pelo WhatsApp."

These strings are asserted character-for-character by tests. Changing them is a deliberate act
that updates both the copy and its test.

**Verify:** the content owner has signed off on all three, including the Portuguese, which is
not a machine translation of the Spanish and should be read by someone who speaks it.

## 3. Groq account, privacy terms, model choice

**Blocked because:** no account exists and no key has been issued.

Required before release:

- An account with billing limits set. The global quota protects the free tier, but it is a
  ceiling you configure, not one the provider enforces.
- Explicit acceptance of Groq's data-handling terms. Visitor questions leave your infrastructure
  and reach a third party — that is a privacy decision only the owner can make.
- A model chosen for `GROQ_MODEL` that supports structured output
  (`response_format: { type: "json_schema" }`). The adapter depends on it; a model without it
  will fail validation on every request and the chatbot will hand off every time.

**Verify:** a smoke call returns a structured object, and the model id is pinned in the Vercel
environment rather than defaulted in code.

## 4. KV store account and quota

**Blocked because:** no account exists. The client itself is now implemented —
`chat-api/kv/upstash.ts` speaks the Upstash REST protocol as a thin fetch wrapper over `get`,
`incr` and `expire`, with no added dependency, and is covered by 19 tests.

Required before release:

- An Upstash Redis database (or an equivalent REST-compatible store) with its own quota headroom.
- `CHAT_API_KV_URL` and `CHAT_API_KV_TOKEN` set on the API.
- Quota values chosen for `CHAT_API_CLIENT_QUOTA`, `CHAT_API_GLOBAL_QUOTA` and
  `CHAT_API_QUOTA_WINDOW_SECONDS`.

A wrong token or an unreachable store fails closed with `PROVIDER_UNAVAILABLE`, so a
misconfiguration surfaces as an outage rather than as an unmetered API.

**Verify:** quota counters appear under `chat-api:quota:*` after a request, and exhausting a
client quota returns `RATE_LIMITED` (429).

**No remaining code gap.** `chat-api/app.ts` wires config, KV, provider and retriever, and
`chat-api/api/chat.ts` exposes it as a serverless function. The package is deployable as soon as
this gate and gates 3 and 5 are met.

## 5. DNS for `api.ijac.com.ar`

**Blocked because:** the subdomain does not resolve.

Required: a CNAME for `api` pointing at Vercel, the domain added to the Vercel project, and a
certificate issued. Setup steps are in the runbook.

**Verify:** `dig +short api.ijac.com.ar` resolves and `curl -sI https://api.ijac.com.ar` returns
an HTTP response over a valid certificate.

## 6. Preview smoke evidence

**Blocked by gates 1–5.** Cannot be attempted until the API is reachable and configured.

Run the smoke checks in the runbook against a preview deployment, using that preview's **exact**
origin added temporarily to `CHAT_API_ALLOWED_ORIGINS` and removed afterwards. Keep the output
with the release record.

The checks that matter most, because they are the ones that fail closed in production rather
than in a test: an off-script question returns `UNKNOWN`; a disallowed origin returns 403; and
all three languages cite only approved `ijac.com.ar` sources.

## 7. Secret and log inspection in production

**Partially met.** The repository side is verified and re-runnable:

- No secret-shaped literals in tracked files; no `.env` tracked; `.gitignore` covers `.env*`.
- Build artifacts contain zero occurrences of `groq`, `gsk-`, `GROQ_API_KEY`, `clientKeySecret`
  or `UPSTASH`, and none of the server symbols.
- Zero `console.*` calls exist in `chat-api/`, `src/app/components/chat/` or `packages/`, so
  there is no code path by which a prompt, answer or raw IP could reach a log sink.

**Still required after deployment:** confirm the Vercel runtime logs contain no prompt, answer or
raw IP address, and that the Groq dashboard retains nothing beyond what the accepted terms allow.
Only aggregate telemetry may persist: `outcome`, `sourceIds`, `language`, `latencyBand`,
`errorCategory`, expiring after 30 days.

---

## Sign-off

Release requires all seven. Record who approved what and when.

| Gate | Approved by | Date | Evidence |
|---|---|---|---|
| 1 Knowledge base | | | |
| 2 Localized copy | | | |
| 3 Groq account and terms | | | |
| 4 KV store and client | | | |
| 5 DNS | | | |
| 6 Preview smoke | | | |
| 7 Secrets and logs | | | |
