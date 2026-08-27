# Proposal: Stage 2 Grounded AI Chatbot

## Why

The deterministic chatbot cannot safely answer open-ended questions. Stage 2 gives visitors Spanish, English, and Portuguese answers grounded only in approved iJAC content, with contact handoff.

## What Changes

### In Scope
- Preserve deterministic quotation, support, contact, hours, location, and answered-service flows; route only unmatched open-ended questions to AI.
- Add an isolated same-repository Vercel API at `api.ijac.com.ar` for single-question, ephemeral processing.
- Use versioned approved knowledge through a CMS-ready repository and lexical retrieval; include relevant allowlisted iJAC links.
- Use Groq's TypeScript SDK behind a provider-neutral adapter; design selects a free structured-output model configured by environment.
- Fail closed to draft localized unknown cards with source/contact actions; enforce client/global quotas and a kill switch.
- Retain only outcome, source IDs, language, latency band, and error-category aggregates for 30 days.

### Out of Scope
- CMS/auth/CRUD/database, embeddings, web search, general knowledge, multi-turn context, retained content/raw IP, streaming, voice, or redesign.
- Full-site server runtime migration or changes to the authoritative Vercel-hosted static frontend.

## Capabilities

### New Capabilities
- `grounded-chatbot-ai`: Grounded multilingual answers, hybrid routing, safe fallback, privacy, controls, and operations.

### Modified Capabilities
- None.

## Approach

Keep the frontend static. A versioned API validates one question, retrieves evidence, and gives Groq only that evidence. Invalid output, insufficient evidence, or failures return localized unknown plus WhatsApp/contact handoff. Deploy independently.

## Considered Alternatives

### Claim-identity grounding — rejected 2026-08-27

An amendment proposed removing provider-authored prose entirely: the provider would return only claim and source identities, and the API would join pre-approved ES/EN/PT sentences in canonical rank order. It was rejected.

| Factor | Claim-identity selection | Chosen: provider-authored, validated |
|---|---|---|
| Fabrication risk | Impossible by construction | Layered validation; residual accepted |
| Off-script questions | Cannot answer; always hands off | Answered within retrieved evidence |
| Localized wording | Pre-approved per claim | Provider-generated, evidence-limited, validated |
| Added machinery | Claim identities, per-claim canonical ranks, drift tokens, re-resolution | Reuses shipped retrieval and validation |

Rationale: the identity design bought fabrication-proofness by removing the assistant's ability to answer anything not already written verbatim, which defeats this proposal's intent. Shipped `chat-api/validation.ts` already rejects injection, negation, subject/object role inversion, numeric drift, conflicting approved prices, claims unbound to cited evidence, unknown source IDs, non-canonical URLs, and unknown provider fields.

Accepted residual risk: validation enumerates known attack shapes rather than proving semantic entailment, so a novel bypass class remains possible. Compensating controls are the retrieval threshold (the provider is never called below it), evidence-only prompting, strict structured output, and fail-closed handoff. Revisit this decision if a bypass reaches production.

## Impact

| Area | Impact | Description |
|---|---|---|
| `src/app/components/AIChat.tsx` | Modified | Answer cards, sources, handoff |
| `src/app/components/chat/` | Modified | Hybrid precedence and telemetry |
| Isolated API deployable | New | Retrieval, provider, controls |

## Dependencies and Release Gates

- Owner approval of knowledge, URLs, and localized copy; public-content changes require reapproval.
- Groq privacy acceptance, free-tier/model availability, and owner-configured DNS.
- Runtime smoke evidence, secret scan, and Vercel/Groq logging checks.

## Assumptions and Risks

Assumptions: Vercel remains authoritative; owner-managed DNS and a suitable free Groq model remain available.

| Risk | Mitigation |
|---|---|
| Unsupported/mistranslated claims | Thresholds, validation, adversarial tests, fail closed |
| Public API abuse/free-tier exhaustion | Conservative quotas, aggregate monitoring, kill switch |
| Knowledge drift/provider retention | Reapproval and privacy gate |

## Rollout and Rollback

Promote independently after gates and preview smoke checks. The frontend flag restores deterministic-only behavior; disable or roll back the API separately.

## Success Criteria

- [ ] Deterministic regression flows remain unchanged.
- [ ] All three languages cite only approved sources; unsupported/failure cases hand off.
- [ ] No content, raw IP, or secret is retained/exposed; aggregates expire after 30 days.
- [ ] Production gates and independent rollback are evidenced.

## Question Round

Resolved by approved decisions.
