# Chatbot release gates

These gates block **release**, not local implementation. Every one of them requires an account,
a credential, a DNS record, or a human approval that cannot be produced from the codebase.

The implementation is complete and verified without any of them: 381 tests, typecheck, lint and
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
| 2 | Localized copy approval | Content owner | ✅ Met — approved 2026-08-27 |
| 3 | Groq account, privacy terms, model choice | Account owner | ✅ Met — `openai/gpt-oss-120b` verified 2026-08-29 |
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

**Met on 2026-08-27.** The handoff wording is contractual and appears verbatim to visitors. It
lives in `UNKNOWN_COPY` in `src/app/components/chat/hybridChat.ts` and is asserted
character-for-character by tests, so changing it is a deliberate act that updates copy and test
together.

- ES — "No encontré información aprobada para responder con precisión. Escribinos por WhatsApp."
- EN — "I could not find approved information to answer safely. Contact us on WhatsApp."
- PT — "Não encontrei informação aprovada para responder com segurança. Fale conosco pelo WhatsApp."

Two corrections were made during review:

**Register.** The Spanish read "Escríbenos", which is tuteo, while the rest of the chatbot speaks
Argentine voseo throughout (`Querés`, `Tenés`, `Podés`, `Escribí`, `Decime`, `coordiná`). It now
reads "Escribinos". "con seguridad" also became "con precisión" to match the wording the
deterministic fallback in `chatEngine.ts` already uses for the same situation.

**The card promised a channel it did not provide.** `contactHandoff` only emitted telemetry, so a
visitor was told to write on WhatsApp and given no way to do it. Handoff cards now render a
keyboard-reachable link to `business.whatsappUrl` showing `business.phoneDisplay`, so the number
is usable even without opening WhatsApp. Deterministic contact answers carry the same link;
successful answers do not.

**Verify when copy changes:** a speaker should read the Portuguese, which is not a machine
translation of the Spanish. Keep all three strings in the register the rest of the site uses.

## 3. Groq account, privacy terms, model choice

**Met on 2026-08-29.** `GROQ_MODEL` is pinned to `openai/gpt-oss-120b`, verified against the live
API for strict `response_format: { type: "json_schema" }`, correct refusal behaviour, and Spanish
that our own grounding validator accepts.

The account owner still carries two responsibilities that no test can discharge: **set a spend
limit in the Groq console** — `CHAT_API_GLOBAL_QUOTA` is a ceiling enforced by our code, not by
Groq's billing — and accept Groq's data-handling terms, since visitor questions leave your
infrastructure and reach a third party.

### What the live probe found

Three defects survived 381 passing tests because every test fakes the transport. Only a real call
exposed them.

**The response schema was invalid.** `sources.items` declared `id`, `title` and `url` but required
only the first two. Groq's strict mode requires every declared property to be required, so *every*
request would have returned 400, the failure would have classified as permanent, and every visitor
would have received the WhatsApp card. The chatbot would have looked deployed and been inert.

The fix removed `title` and `url` from the model's schema entirely rather than adding them to
`required`. The validator already discarded any title or url that did not match the approved entry
exactly, so the model was echoing data we own and we were checking the echo. It now returns ids
only, and `toResponseSources` fills in the rest from the approved entry — a fabricated source link
is structurally impossible instead of merely rejected.

**The pinned model no longer existed.** `llama-3.3-70b-versatile` returns `model_not_found`; Groq
retires models on a rolling schedule. Check `GET /openai/v1/models` before pinning a replacement.
The code already handles this correctly at runtime: `classifyProviderFailure` treats a 404 as
permanent rather than retry-eligible, so a future retirement fails fast to `PROVIDER_UNAVAILABLE`
and the site falls back to deterministic answers instead of burning its retry budget.

**The grounding validator rejected every correct answer.** Three models produced accurate,
evidence-limited Spanish and all three were refused — meaning the chatbot would have handed off
every visitor even with a valid schema. Two causes:

- `COMMON_WORDS` held 22 mostly-English entries, so ordinary Spanish connectives (`incluyendo`,
  `así`, `como`) counted as unsupported claims. They assert nothing, so blocking them bought no
  safety. The list now covers connectives, prepositions, articles, pronouns and copulas in all
  three languages. Quantifiers (`todos`, `cada`, `siempre`) are deliberately excluded — those
  would let an answer widen a claim the evidence never made.
- Token matching was literal, so Spanish morphology failed: `macbooks` did not match the alias
  `macbook`, and `repara` did not match `reparación`. A token now also matches when it shares a
  six-character prefix with an evidence term. Six is the tested boundary — `reparto` shares only
  five with `reparación` and stays rejected. Tests pin the bound from both sides.

Every other guard is unchanged: negation tokens, exact numeric comparison, the URL allowlist,
injection tokens, role inversion, and the floor of two evidence hits per sentence.

### Live probe results

Question with evidence, question about prices (evidence contains none), and an off-topic question:

| Model | Grounded | Price question | Off-topic |
|---|---|---|---|
| `openai/gpt-oss-120b` | answered, cited, accepted | `supported: false` | `supported: false` |
| `openai/gpt-oss-20b` | answered but ungrammatical Spanish | `supported: false` | `supported: false` |
| `qwen/qwen3.8-27b` | answered, cited, accepted | `supported: false` | `supported: false` |

`gpt-oss-120b` was chosen for correct Spanish and a concise answer. `gpt-oss-20b` produced
"iJAC reparan MacBooks", which fails subject-verb agreement. `groq/compound` was excluded on
design grounds: it carries built-in tool use, and answers must come only from approved evidence.

**Price questions require no special handling.** No approved entry contains a price, so the model
returns `supported: false`, which renders the WhatsApp handoff card. The numeric check in
`validation.ts` is the backstop: any figure absent from the cited claims rejects the answer.

**Re-verify when changing the model:** run the strict-schema probe, confirm a price question still
returns `supported: false`, and confirm a grounded answer passes `validateGroundedOutput`.

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
