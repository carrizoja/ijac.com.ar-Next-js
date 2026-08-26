## Exploration: chatbot-stage2-grounded-ai

### Current State
The site is a Next.js 16.2.4 App Router application exported as static files (`next.config.ts` uses `output: "export"`). The current deployment shape cannot execute request-time Route Handlers, Server Actions, middleware/proxy, ISR, or any server-only Groq client. The browser bundle must never receive `GROQ_API_KEY`. Project guidance describes Hostinger static hosting, while production is also actively deployed through Vercel; preserving a host-independent static frontend therefore has operational value.

The chatbot is mounted globally from `src/app/layout.tsx` and implemented as the client component `src/app/components/AIChat.tsx`. It keeps message text and deterministic flow context only in component memory. `src/app/components/chat/chatEngine.ts` normalizes Spanish input, applies ordered deterministic intent precedence, and owns quotation and support state machines. It also handles contact, hours, location, service summaries, greetings, cancellation, and safe fallback. Business facts come from `src/data/business.ts` and service facts from `src/data/services.js`; `src/app/components/FAQ.tsx` contains additional approved-looking copy but does not export it as reusable knowledge.

Telemetry currently emits browser-only `CustomEvent` aggregates (`opened`, `submitted`, matched/fallback intent, and contact handoff) without message text. No backend receives or persists those events. Vitest runs in Node by default, with jsdom selected per component test. Existing tests cover deterministic intent precedence, flow interruption/cancellation, safe fallback, missing service data, accessibility, overlapping submissions, and privacy-safe telemetry. There is no E2E harness, coverage collection, API integration test boundary, or deployed-runtime smoke test.

CodeGraph was used before filesystem fallback. It confirmed the static-export configuration, global `AIChat` mount, and canonical services dependency, but its current index did not expose the Stage 1 chat modules or tests; direct source reads were required for those boundaries.

### Affected Areas
- `src/app/components/AIChat.tsx` — keep the accessible UI but introduce asynchronous hybrid routing, source-link rendering, unknown/handoff states, and cancellation/timeout safety.
- `src/app/components/chat/chatEngine.ts` — preserve deterministic intents and flows; expose an explicit routing result rather than treating every unmatched input as a final local fallback.
- `src/app/components/chat/chatTelemetry.ts` — extend only privacy-safe outcome metadata; never include prompts, answers, IP addresses, or transcripts.
- `src/data/business.ts` — canonical contact/location/hours facts and handoff targets.
- `src/data/services.js` — canonical service facts and website source URLs/slugs.
- `src/app/components/FAQ.tsx` — currently duplicates useful knowledge that should be moved to or generated from a shared approved corpus rather than scraped from rendered pages.
- `next.config.ts` — remains unchanged for the recommended static-frontend option; would be a migration boundary for a full Next.js runtime.
- `package.json` / lockfile — eventual SDK, validation, and test dependencies; `groq-sdk` must be confined to the server deployable.
- `vitest.config.mts` and existing chat tests — add contract, retrieval, adapter, handler, and hybrid-router coverage while retaining current deterministic regression tests.
- New repository-versioned knowledge module — curated entries with stable IDs, approved claims, retrieval aliases, locale metadata, and allowlisted iJAC URLs; shaped behind a `KnowledgeRepository` interface for a future CMS adapter.
- New server deployable (tentatively `apps/chat-api/`) — HTTP boundary, validation, rate limiting, retrieval, grounded answer orchestration, Groq adapter, and aggregate telemetry. Its exact path depends on the repository/deployment decision below.

### Approaches
1. **Keep the static frontend and add a separately deployed Vercel API boundary** — place a small server-only deployable in the same repository (preferred) or a dedicated repository, expose it through an iJAC-controlled API origin, and let both Vercel-hosted and Hostinger-hosted static builds call it.
   - Pros: preserves static export and Hostinger compatibility; keeps `GROQ_API_KEY` server-only; smallest site blast radius; API and site have independent preview, promotion, rollback, limits, and observability; clean provider and future CMS adapters.
   - Cons: requires CORS allowlisting, two deployment units, API-domain/DNS ownership, and coordination when frontend/API contracts change. A cross-origin endpoint remains publicly callable, so CORS is not an abuse control.
   - Effort: Medium

2. **Migrate the whole site to the full Next.js server runtime on Vercel** — remove `output: "export"` and add a same-origin `app/api/chat/route.ts` Node.js handler.
   - Pros: one deployment, same-origin requests, simple environment-secret setup, no production CORS, native Route Handler integration, and an easier path to future server-rendered/CMS features.
   - Cons: couples chatbot rollback to the site; removes direct Hostinger-static equivalence; expands deployment and regression scope far beyond Stage 2; makes current static-host guidance and some scripts/documentation obsolete; adds server-runtime operations before another feature requires them.
   - Effort: Medium-High

3. **Use another edge/serverless provider for only the API** — for example, an edge worker with a custom domain.
   - Pros: can preserve the static frontend and may offer attractive edge quotas.
   - Cons: adds a second cloud platform, another runtime compatibility surface for the official SDK, separate secrets/observability, and no material product advantage over the already-used Vercel platform.
   - Effort: Medium

No third option is materially better for this stage. A browser-side Groq call is categorically unsafe, and a self-hosted Node service is disproportionate operational work for the expected small corpus and traffic.

### Recommendation
Use **Approach 1: a separate Vercel serverless API deployment while preserving the static frontend**. Keep its source in the same repository as an isolated deployable if Vercel project-root configuration supports clean independent builds; otherwise use a dedicated API repository. Serve it from an iJAC-controlled origin such as `api.ijac.com.ar` so Vercel and Hostinger frontends can coexist without changing the browser contract. Production CORS should allow only the exact canonical iJAC origins; preview origins should be enabled only in preview configuration. Deploy and roll back the frontend and API independently, with a versioned request/response contract.

The API should use a small layered boundary:

1. HTTP handler validates method, content type, origin, body schema, and strict payload size.
2. Abuse guard applies a conservative per-client/request bucket using an approved platform capability; it must not store prompts.
3. A deterministic router rejects empty/oversized input and handles API-level policy.
4. A `KnowledgeRepository` returns repository-versioned approved entries in Stage 2 and can later be replaced by a CMS adapter.
5. A deterministic lexical retriever normalizes tokens and scores curated titles, tags, questions, and multilingual aliases; it returns a small top-K set only above a tested evidence threshold.
6. If evidence is absent, the API returns the explicit unknown response plus WhatsApp/contact handoff without calling Groq.
7. A provider-neutral `GroundedAnswerProvider` receives only the question, requested language, and selected approved evidence. `GroqGroundedAnswerProvider` is the initial adapter; model name, timeout, and retry count are environment configuration.
8. The model returns a strict JSON-schema object such as `{ supported, answer, language, sourceIds }`. The server parses it again with a runtime schema, rejects unknown source IDs/URLs, requires at least one retrieved source for a supported answer, and fails closed to the unknown/handoff response.
9. The response contains an allowlisted iJAC source link when the selected entry has one. Aggregate telemetry records only outcome codes, source IDs, language code, coarse latency, and provider/error category.

#### Retrieval decision
Embeddings and vector storage are **not justified** for the current corpus. The approved knowledge is small, structured, versioned, and dominated by explicit business, service, FAQ, contact, and website facts. Deterministic server-side lexical scoring over curated entries is cheaper, auditable, testable, easy to fail closed, and CMS-ready through the repository interface. Curated multilingual aliases can improve Spanish/English/Portuguese recall without introducing new claims. Revisit embeddings only when corpus size, synonym coverage, or measured retrieval misses exceed agreed thresholds; do not add a vector database preemptively.

#### Hybrid routing boundary
Intent precedence should remain explicit and testable:

1. Cancellation/reset and safety guards.
2. Active deterministic flow controls and explicit interruptions.
3. Quotation, support, and contact intents.
4. Existing deterministic business/service answers that already satisfy the question.
5. Grounded AI retrieval only for a genuine open-ended question not fully answered above.
6. Explicit unknown plus contact handoff for insufficient evidence or any backend/provider failure.

The AI path must not mutate quotation/support state. For an open-ended interruption, preserve or explicitly suspend the structured flow context and resume only through a deliberate UI action; never infer flow progress from model output. The first slice should remain single-turn for AI questions: send the current question and structured non-text routing context only, not the visible transcript. Multi-turn AI follow-ups require a separate product/privacy decision.

#### Trust boundaries and failure behavior
- **Browser to API:** browser input is untrusted. Accept one question only, with a small explicit character/byte limit; reject extra fields and arbitrary conversation history.
- **API secret boundary:** `GROQ_API_KEY`, model configuration, and provider code exist only in the API deployment. No `NEXT_PUBLIC_` secret and no Groq SDK import may enter client-reachable modules.
- **Knowledge boundary:** only reviewed repository entries and allowlisted `https://ijac.com.ar/...` URLs are evidence. Never scrape arbitrary URLs or accept sources from the visitor/model.
- **Model boundary:** user text is delimited as data and cannot change system policy. Prompt injection requests to ignore evidence, reveal prompts/secrets, browse, or use general knowledge must produce grounded evidence only or unknown.
- **Output boundary:** strict provider JSON schema plus independent runtime validation; reject malformed output, unsupported source IDs, empty supported answers, and language/source mismatches.
- **Unsupported claims:** retrieval below threshold, `supported: false`, or invalid citations returns a localized explicit unknown response and WhatsApp/contact handoff.
- **Timeout/retry:** use a short configured deadline and at most one bounded retry for transient failures; do not retry validation/auth failures. Timeout, 429, connection failure, model removal, invalid JSON, and 5xx all degrade to the same safe handoff UX with distinct aggregate error codes.
- **Multilingual fidelity:** detect/request the visitor language, retrieve through curated aliases, and instruct the provider to translate only selected evidence. Names, prices, hours, qualifiers, and URLs must not be expanded. Unknown responses must also be localized. Initial supported languages remain unresolved.
- **Abuse:** enforce payload limits, method/content-type checks, exact origin policy, platform-level or distributed rate limiting, and a global cost/traffic kill switch. CORS alone is insufficient.
- **Privacy:** process each request ephemerally; disable prompt/body logging and SDK debug logs; do not persist message/answer text or raw IPs. Verify Vercel and Groq account-level logging/retention settings before production. Aggregate telemetry needs an approved sink and retention period.

#### Test and runtime evidence strategy
- Preserve all deterministic engine and accessible UI tests as regression gates.
- Unit-test normalization, multilingual aliases, retrieval ranking/thresholds, source allowlisting, unknown behavior, hybrid intent precedence, active-flow preservation, payload limits, and telemetry redaction.
- Contract-test the frontend client and API schemas from shared fixtures without importing server/provider code into the browser bundle.
- Adapter-test Groq with a fake transport for timeout, retry, 429, 5xx, malformed JSON, unsupported citations, and configured model changes; do not make ordinary CI depend on the live free tier.
- Handler integration-test HTTP status, CORS, origin rejection, schema validation, rate limiting, and safe fallback with injected fake provider/repository.
- Add a small adversarial groundedness corpus: prompt injection, unrelated general knowledge, conflicting user-provided facts, unsupported pricing/availability, multilingual paraphrases, and source-link checks.
- Because no E2E harness exists, require a deployed preview smoke script or minimal runtime probe that verifies allowed/disallowed origins, no secret in static assets, valid grounded response, unknown/handoff response, provider-failure fallback, and aggregate-only logs. A manual browser accessibility check should cover async loading, source-link focus, cancellation, and fallback.
- Verification evidence should include `npm test`, `npx tsc --noEmit`, `npm run build`, API unit/integration tests, static-bundle secret scan, preview endpoint smoke results, and redacted platform-log inspection. The known lint-command/tooling issue must be reported separately rather than silently treated as proof.

#### First slice boundaries
The first slice should include only: the API contract; repository-backed curated knowledge; deterministic retrieval; provider adapter; one stateless chat endpoint; strict validation and safe fallbacks; hybrid client routing; source-link/handoff rendering; privacy-safe aggregates; focused tests; and independent deploy/rollback instructions. Keep the existing deterministic quotation, support, contact, hours, location, and directly answered service flows unchanged.

#### Explicit non-goals
- CMS dashboard, authentication, roles, CRUD, editorial workflow UI, or database.
- Embeddings, vector database, semantic cache, web search, crawling, or arbitrary URL ingestion.
- General-knowledge answers, autonomous tools/agents, recommendations beyond approved claims, or model-driven deterministic flow state.
- Persistent transcripts, conversation accounts, lead storage, raw prompt analytics, or training-data collection.
- Full-site server-runtime migration, streaming responses, voice, attachments, or broad chatbot redesign.

#### Rollback boundary
The frontend AI path must be controlled by a public non-secret endpoint/feature configuration or deploy-time flag. Rollback disables AI routing and restores the existing deterministic fallback without removing the chatbot. The API can be rolled back or disabled independently; every API outage already degrades to the same deterministic unknown/contact response. Knowledge and API contract changes should be versioned so the previous API deployment remains compatible with the current frontend during rollback.

#### Decisions required before proposal
1. Which production topology is authoritative: Vercel-only, Hostinger-only static files plus Vercel API, or supported dual hosting?
2. May the API use `api.ijac.com.ar`, and who owns DNS/configuration and the allowed production/preview origin list?
3. Should the API source live as an isolated deployable in this repository or in a separate repository/project?
4. Who approves each knowledge entry and source URL, and what freshness/review rule applies when site copy changes?
5. Which visitor languages are required in the initial release, and is model translation of approved Spanish evidence acceptable for each?
6. Is single-turn AI sufficient for Stage 2, or may a bounded recent transcript be sent ephemerally to Groq for follow-up questions?
7. Has Groq's applicable data retention/processing policy been accepted for customer questions, including the free account used for launch?
8. What launch traffic/cost ceiling, per-client rate, global kill switch, and rate-limit mechanism are approved under Vercel/Groq free-tier constraints?
9. Where should privacy-safe aggregate telemetry be sent, and what retention period is allowed?
10. What exact localized unknown/handoff copy and source-link presentation are product-approved?
11. Which configured Groq model is approved at launch after confirming current free-tier availability and structured-output support?

### Risks
- Model output can remain semantically unsupported despite valid JSON/citations; deterministic evidence thresholds, adversarial evaluations, and fail-closed behavior reduce but do not eliminate this risk.
- A separate public API adds abuse/cost exposure and cross-origin configuration; free-tier limits and rate-limit capabilities require operational confirmation.
- Repository knowledge can drift from visible website copy unless ownership and review rules are established.
- Multilingual translation can alter qualifiers or introduce claims; supported languages and groundedness tests must be explicit.
- Ephemeral application processing does not by itself prove provider/platform non-retention; account policies and logging configuration must be verified.
- Full Next.js runtime migration would create an unnecessary site-wide deployment and rollback blast radius for Stage 2.
- The current README and deployment guidance contain stale/inconsistent runtime claims, which can mislead operations even though documentation changes are outside this exploration artifact.

### Ready for Proposal
No. The architecture is sufficiently explored, but the orchestrator should ask the user to resolve the eleven product/operational decisions above, especially authoritative hosting topology, API ownership/domain, supported languages and conversation scope, provider privacy acceptance, knowledge ownership, and free-tier abuse/cost controls. Once resolved, the proposal should select the separate Vercel API boundary and keep all deferred capabilities as explicit non-goals.
