# Tasks: Stage 2 Grounded AI Chatbot

## Review Workload Forecast
| Signal | Value |
|---|---|
| Estimated authored additions + deletions | 1,460 (generated goldens excluded; all snapshot paths included in identity) |
| 800-line budget risk | High |
| 400-line reviewer burden risk | High |
| High-risk indicators | New workspace/API, secrets, provider/KV controls, privacy, UI/a11y, deployment gates |
| Suggested autonomous slices | Contracts; knowledge/retrieval; API controls; provider/handler; frontend; release operations |
| Delivery strategy | ask-on-risk → chained PRs |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units
| PR / merge order | Dependency; start → finish; likely files | Verification; rollback |
|---|---|---|
| PR 1 / first | None; static app → contracts/workspace in `packages/contracts/`, `package.json` | `npm test -- contracts`; N/A—no credentials; revert contract/workspace files |
| PR 2 / second | PR 1; contracts → repository/retriever in `packages/knowledge/` | `npm test -- knowledge`; N/A—fixtures; revert knowledge/retrieval files |
| PR 3 / third | PR 2; retriever → controls in `chat-api/` | `npm test -- chat-api/controls`; fake Redis; revert controls/config files |
| PR 4 / fourth | PR 3; controls → provider/handler in `chat-api/` | `npm test -- chat-api/handler`; fake HTTP/KV; revert provider/handler files |
| PR 5 / fifth | PR 4; deterministic UI → hybrid cards in `AIChat.tsx` and `chat/` | `npm test -- AIChat chatEngine`; keyboard scenario; revert UI/flag changes |
| PR 6 / sixth | PR 5; preview-ready feature → runbook/gates in `chat-api/README.md`, `docs/` | `npm test`; preview smoke after owner setup; revert operational docs/config |

All slices target `main` and merge in order; each child starts from the preceding merged slice. Tests/fixtures and operational docs stay with their behavior slice; no slice uses live Groq or production infrastructure.

## Phase 1: Contracts and Foundation
- [x] 1.1 RED: add strict tests for one-question `ChatRequest`, `ChatResponse`, versions, supported languages, no extras/history/attachments/streaming, and server-only package boundary; GREEN: add `packages/contracts/chat.ts`, workspace/API manifests without Groq/Upstash in frontend.
- [ ] 1.2 RED: test `KnowledgeEntry` approval/freshness/stable-ID and exact `https://ijac.com.ar/...` URL rules; GREEN: add `packages/knowledge/types.ts` and versioned approved fixtures with owner/reapproval metadata.

## Phase 2: Grounding and API Core
- [ ] 2.1 RED: fixtures for normalization, aliases, weights (tags 3/title 2/aliases 2/claims 1), K=3, threshold, version/freshness ties, unrelated and ambiguous queries; GREEN: implement `packages/knowledge/retriever.ts`.
- [ ] 2.2 RED: adversarial fixtures for injection, conflicting price, unsupported/mistranslated claims, unknown source/URL, Portuguese paraphrase, and no-URL evidence; GREEN: implement evidence/output validation and localized safe results in `chat-api/validation.ts`.
- [ ] 2.3 RED: test invalid method/type/size/JSON/origin, extra transcript, quota/global quota, KV outage, operational kill switch, deploy flag, HMAC-only client key, retry/timeout/429/5xx/connection/model removal, 30-day TTL and aggregate-only logs; GREEN: implement `chat-api/config.ts`, `cors.ts`, `privacy.ts`, `controls.ts`, fake Redis.
- [ ] 2.4 RED: fake transport tests proving Groq receives only question/language/evidence and max one eligible 5xx retry; GREEN: implement provider-neutral `chat-api/providers/groq.ts` using SDK, env model, structured output, and fake transport.

## Phase 3: Wiring and Presentation
- [ ] 3.1 RED: handler tests for precedence, no provider below threshold, safe statuses/fallbacks, and no transcript/state mutation; GREEN: add `chat-api/v1/chat.ts` and route wiring.
- [ ] 3.2 RED: `chatEngine`/`AIChat` tests for active quotation preservation/explicit resume, flag-off deterministic fallback, localized ES/EN/PT cards, source/contact/cancellation; GREEN: wire hybrid API routing.
- [ ] 3.3 RED: keyboard/Escape/focus/live-region/no-trap tests for async completion and source/contact cards; GREEN: implement accessible UI and predictable context retention.

## Phase 4: Verification and Release Operations
- [ ] 4.1 Run `npm test`, typecheck, lint, static build, deterministic regression, secret scan, and redacted-log inspection; generated goldens remain excluded from authored count but included in snapshot identity.
- [ ] 4.2 Add `chat-api/README.md` and `docs/` runbook covering env/config, DNS `api.ijac.com.ar`, preview exact origins, quota/kill switch, independent frontend/API rollback, and smoke evidence.
- [ ] 4.3 Mark owner/account gates explicitly: knowledge/copy approval, Groq privacy/free-model acceptance, Upstash account/quota, DNS, preview smoke, secrets and logs; these block release, not local implementation, and live Groq/production infrastructure stays out of ordinary CI.
