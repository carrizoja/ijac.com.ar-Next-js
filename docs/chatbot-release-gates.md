# Chatbot release gates

These gates block **release**, not local implementation. Every one of them requires an account,
a credential, a DNS record, or a human approval that cannot be produced from the codebase.

The implementation is complete and verified without any of them: 389 tests, typecheck, lint and
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
| 3 | Groq account, privacy terms, model choice | Account owner | ✅ Met — model verified 2026-08-29; ZDR and spend limit set 2026-09-06 |
| 4 | KV store account and quota | Account owner | ✅ Met — Upstash Redis verified 2026-09-06 |
| 5 | DNS for `api.ijac.com.ar` | Domain owner | ✅ Met — resolving over TLS 2026-09-12 |
| 6 | Preview smoke evidence | Release owner | ✅ Met — full checklist passed 2026-09-13 |
| 7 | Secret and log inspection in production | Release owner | ✅ Met — runtime logs inspected 2026-09-13 |

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

### Account owner responsibilities

Both were completed on 2026-09-06. Neither can be discharged by a test, and neither is visible
from the codebase — re-check them after any change of Groq account, plan or organization.

**Zero Data Retention is enabled** (`console.groq.com/settings/data-controls`, organization-wide).
Groq's default is not zero retention: inference requests are not stored, but inputs and outputs
may be temporarily logged for reliability troubleshooting and abuse investigation and kept for up
to 30 days. Visitor questions leave our infrastructure and reach a third party, so that window was
closed deliberately rather than accepted by default.

ZDR disables batch processing (`/openai/v1/batches`) and fine-tuning
(`/openai/v1/fine_tunings`). Neither is reachable from this codebase: `providers/groq.ts` makes a
single `client.chat.completions.create` call and touches no other Groq surface. Enabling ZDR
therefore costs us nothing — but a future change that reaches for either endpoint will fail, and
the fix is to reconsider the feature, not to switch retention back on.

**A monthly spend limit of $25 is set**, with alerts at $5, $10 and $20
(Settings → Billing → Limits). `CHAT_API_GLOBAL_QUOTA` is a ceiling enforced by our code; it does
not cap Groq's billing, which is why a limit on the provider side is required as well.

$25 is a blast radius, not a forecast. Measured against the three largest approved entries plus a
full-length question, a worst-case request costs about $0.00051 — roughly 1,426 input tokens at
$0.15/M and a 500-token output budget at $0.60/M, the output budget being generous because
`gpt-oss-120b` bills reasoning tokens as output. `CHAT_API_GLOBAL_QUOTA=500` per hour permits
360,000 requests a month, or about $184, if the quota were saturated every hour of every day.
Realistic traffic is a few hundred questions a month, under a dollar.

**The provider limit therefore binds before our own quota does under abuse, and that is safe.**
Groq answers `400 blocked_api_access`; `classifyProviderFailure` maps any non-429, non-5xx status
to `PROVIDER_UNAVAILABLE` with `retryEligible: false`, so a blocked account produces no retry
storm and visitors receive the WhatsApp handoff card. The website stays up.

Two caveats from Groq's documentation: spend tracking lags 10–15 minutes, so a spike can overshoot
the limit slightly, and the limit resets on the 1st of each month.

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

**Met on 2026-09-06.** An Upstash Redis database exists and its REST credentials were verified
against the live store before being trusted. `chat-api/kv/upstash.ts` speaks the Upstash REST
protocol as a thin fetch wrapper over `get`, `incr` and `expire`, with no added dependency, and
is covered by 19 tests.

Quota values chosen: `CHAT_API_CLIENT_QUOTA=10`, `CHAT_API_GLOBAL_QUOTA=500`,
`CHAT_API_QUOTA_WINDOW_SECONDS=3600` — ten questions per visitor per hour, five hundred across
everyone. Raising the global ceiling is the lever if legitimate traffic is being turned away.
It is a ceiling **our** code enforces; it does not cap Groq's billing, which is why gate 3 also
requires a spend limit in the Groq console.

`CHAT_API_KV_URL` and `CHAT_API_KV_TOKEN` are not yet set on any deployment — they go into the
Vercel project environment during gate 5, never into the repository.

### What the credential probe checked

The credentials were exercised with the same protocol the client uses — plain `GET`, a bearer
token, a percent-encoded key — against a throwaway key, so no real counter was touched.

- The URL is `https:`. `config.ts` validates it as `httpsUrl`, so the `redis://` connection
  string shown next to it in the Upstash console is rejected at load time rather than at runtime.
- `get` on a missing key returns null, which is how `evaluateGate` distinguishes "no kill switch"
  from "kill switch set".
- `incr` and `expire` both succeed. This is the check that matters: a **read-only** token can
  `get` but not `incr`, so the store would appear reachable and then throw on the first real
  request. Every visitor would receive `PROVIDER_UNAVAILABLE` and the chatbot would be silently
  offline behind a working-looking configuration.
- The TTL survives a subsequent `incr`. If incrementing reset the window, a caller who kept
  knocking would never be released from the rate limit.
- A `set`/`get` round-trip on a string value confirms the kill switch is writable, since
  `chat-api:kill-switch` is set by hand during an incident rather than by the API.

Eviction is disabled on the database. Eviction could drop `chat-api:kill-switch` under memory
pressure and re-enable a chatbot that was deliberately shut off.

A wrong token or an unreachable store fails closed with `PROVIDER_UNAVAILABLE`, so a
misconfiguration surfaces as an outage rather than as an unmetered API.

**Verify after deployment:** quota counters appear under `chat-api:quota:*` after a request, and
exhausting a client quota returns `RATE_LIMITED` (429).

**No remaining code gap.** `chat-api/app.ts` wires config, KV, provider and retriever, and
`chat-api/api/chat.ts` exposes it as a serverless function. The package is deployable as soon as
gate 5 is met.

## 5. DNS for `api.ijac.com.ar`

**Met on 2026-09-12.** The subdomain resolves to Vercel and serves the API over a valid
Let's Encrypt certificate. The website is untouched: `ijac.com.ar` still answers from Hostinger.

```
api.ijac.com.ar.  CNAME  9441a58f124c245b.vercel-dns-017.com.
```

**The CNAME target is unique to the project.** Vercel no longer uses a shared
`cname.vercel-dns.com` for subdomains; it still accepts that value as a fallback, but the
project-specific target is what its dashboard and `vercel domains verify` return. Read the value
from the project rather than copying it from any document, including this one.

The API lives in its own Vercel project, `ijac-chat-api`, rooted at `chat-api/` with an empty
build command — there is nothing to build, since Vercel's Node runtime compiles the function
itself. It must be a **separate project** from any that deploys the website: a project has one
root directory, and its deployment history is the rollback target the runbook depends on. A
project shared with the website would offer website builds as "the previous API version".

**The certificate needed an explicit request.** Automatic issuance had not fired several minutes
after the domain verified; `vercel certs issue api.ijac.com.ar` produced it in twelve seconds.
Until a certificate exists the domain answers plain HTTP correctly while HTTPS fails at the TLS
handshake, which reads like a DNS fault and is not one.

### What the first deployment found

Two defects survived 389 passing tests, a clean typecheck and a clean lint, for the same reason
the gate 3 defects did: the test toolchain resolves differently from the production runtime.
Both are fixed and covered.

**Every relative import was unloadable.** Vercel transpiles each function file individually
rather than bundling it, so `import "../app"` reached the deployed JavaScript unchanged — and
Node's ESM resolver requires an explicit extension. All 37 relative imports across 13 shipped
files were extensionless. `tsconfig.json` sets `moduleResolution: "bundler"` with `noEmit`, and
Vitest resolves the same way, so nothing in the suite could see it. `chat-api/moduleResolution.test.ts`
now reads the shipped source directly and also checks that each specifier still resolves to a
`.ts` file, so a rename cannot reintroduce it.

**The entry point exported the wrong shape.** Vercel's Node runtime picks a function's calling
convention from its export: a bare default function receives Node's `IncomingMessage`, and only
the documented `fetch` Web Standard export — `export default { fetch }` — receives a Web
`Request`. The module is written against the Web API, so it deployed cleanly and threw
`request.headers.get is not a function` on every call.

**Verify:** `dig +short api.ijac.com.ar` resolves, and a POST from an allowed origin returns a
JSON body. A **bare** 503 with an empty body means configuration failed to load; a 503 carrying
`{"code":"DISABLED"}` means configuration is valid and the API is parked, which is the expected
state until gate 6.

## 6. Preview smoke evidence

**Met on 2026-09-13.** Every check in the runbook checklist was run against the live API at
`https://api.ijac.com.ar` and passed.

| Check | Result |
|---|---|
| Preflight from an allowed origin | 204, exact origin echoed, never `*` |
| Disallowed origin | 403, no `answer` field |
| Extra request field | `INVALID_REQUEST`, rejected before any provider call |
| Off-script question | `UNKNOWN` |
| Price question | `UNKNOWN`, which renders the WhatsApp handoff |
| Spanish, English and Portuguese | `SUCCESS`, citing only the approved entry |
| Kill switch set, then removed | `SUCCESS` → `DISABLED` → `SUCCESS`, no redeploy |
| Vercel runtime logs | request line only; no prompt, answer or IP |
| Built `out/` | no `groq`, `gsk-`, `UPSTASH` or server symbol |
| Website with `NEXT_PUBLIC_CHAT_AI_ENABLED` unset | no `api.ijac.com.ar` in the bundle |

Testing ran against production rather than a preview, and that was safe rather than a shortcut:
the live website is the static build on Hostinger and was built without `NEXT_PUBLIC_CHAT_API_URL`,
so no visitor has a code path that reaches the API. The only callers were the checks themselves.
That also removed the need to add a preview origin to `CHAT_API_ALLOWED_ORIGINS` and remember to
take it out again.

### The defect this gate caught

**The validator rejected every correct answer the model produced.** All three languages, every
time. The Portuguese answer carried nineteen evidence hits and was refused over the word "sim".
A chatbot that had passed every earlier gate would have handed every visitor to WhatsApp.

The grounding check required every content word to appear in the evidence. Models paraphrase —
the evidence says "brinda", the model writes "ofrece" — so an accurate answer failed on its own
vocabulary. Three separate causes: affirmations were missing from the function words; plurals of
short evidence terms were unreachable, since the shared-prefix rule refuses anything under six
characters and "macs" is four; and synonyms cannot be bridged by prefix matching at all.

A sentence may now carry up to two unsupported words, strictly under a fifth of its length, and
the system prompt asks the model to reuse the evidence's wording rather than paraphrase it. The
prompt is what keeps the tolerance sufficient: measured against the live model, answers now
reproduce approved claims almost verbatim and barely spend the allowance.

**Tolerance covers vocabulary, never substance.** Prices, guarantees and quantifiers are refused
outright however well grounded the rest of the sentence is — and only when absent from the
evidence, so an entry that genuinely states a price can still have it repeated back.

**A second defect this gate exposed, fixed before sign-off.** Retrieval had the morphology
problem the validator had: "¿Reparan MacBooks?" scored zero against the alias "macbook" and the
alias "reparación", fell below the threshold, and never reached the model. The answer was
approved and available; the question could not find it. The two halves disagreed about what
counts as the same word, which is the arrangement where the chatbot finds an answer and then
refuses to give it. Both now share one rule in `packages/knowledge/morphology.ts`.

Relaxing retrieval is far safer than relaxing grounding: a false match only surfaces an entry
for the model to weigh, and grounding still refuses anything the evidence does not support. The
threshold, the field weights and every grounding guard are unchanged, and unrelated questions
still retrieve nothing — "¿Hacen reparto de mercadería?", "¿Venden seguros para el hogar?" and
"Do you cater weddings?" are pinned as returning no evidence.

## 7. Secret and log inspection in production

**Met on 2026-09-13.** All three sides are verified.

**Repository.** No secret-shaped literals in tracked files, no `.env` tracked, `.gitignore`
covers `.env*`. The built `out/` contains zero occurrences of `groq`, `gsk-`, `GROQ_API_KEY`,
`clientKeySecret` or `UPSTASH`, and none of the server symbols.

**Groq.** Zero Data Retention is enabled on the account, so Groq retains nothing rather than
logging inputs and outputs for up to 30 days. See gate 3.

**Vercel runtime.** Logs from live requests carry the request line and nothing else — no prompt,
no answer, no IP address. This is structural rather than incidental: there are zero `console.*`
calls anywhere in `chat-api/`, `packages/` or `src/app/components/chat/`, so no code path exists
by which a prompt, answer or raw address could reach a log sink. Re-run the check with:

```bash
grep -rn "console\." --include=*.ts --include=*.tsx chat-api packages src/app/components/chat | grep -v "\.test\."
```

Only aggregate telemetry is ever assembled — `outcome`, `sourceIds`, `language`, `latencyBand`,
`errorCategory` — and `latencyBand` is a bucket rather than a timing, so even that cannot
fingerprint a request. Nothing currently writes it anywhere.

The cost of that discipline showed up in this release: a validation rejection and a
retrieval miss both settle to `UNKNOWN` and are indistinguishable from outside, so diagnosing
gate 6 required reproducing the pipeline locally. That is the accepted trade, not an oversight.

---

## Sign-off

Release requires all seven. Record who approved what and when.

All seven are met. The rows below are the owner's record; fill in the approval column to sign
the release off.

| Gate | Approved by | Date | Evidence |
|---|---|---|---|
| 1 Knowledge base | | 2026-08-27 | 8 entries approved, retrieval coverage pinned by tests |
| 2 Localized copy | | 2026-08-27 | Handoff strings asserted character-for-character |
| 3 Groq account and terms | | 2026-08-29 / 09-06 | Model probe; ZDR enabled; $25 spend limit |
| 4 KV store and client | | 2026-09-06 | REST credentials exercised, read-write confirmed |
| 5 DNS | | 2026-09-12 | `api.ijac.com.ar` over a Let's Encrypt certificate |
| 6 Preview smoke | | 2026-09-13 | Full runbook checklist against the live API |
| 7 Secrets and logs | | 2026-09-13 | Repo, Groq ZDR, and Vercel runtime logs all clean |

## After sign-off

The gates cover the API. Switching the chatbot on for visitors is a separate, reversible step,
and it is the only one that changes what the public sees:

1. Merge the change to `main`, then set the Vercel project's production branch back to `main` —
   it currently tracks the feature branch so that gates 5 to 7 could be met before the merge.
2. Rebuild the website with `NEXT_PUBLIC_CHAT_AI_ENABLED=true` and
   `NEXT_PUBLIC_CHAT_API_URL=https://api.ijac.com.ar`, then upload `out/` to Hostinger.
3. Archive the OpenSpec change.

Until step 2, the widget answers deterministically and never calls the API — which is what makes
every gate above safe to have verified against production.
