# Apply Progress: `chatbot-stage2-grounded-ai`

## Reconciled Recovery History

- Prior recovery objective: bounded recovery generation 2, ordinal 3.
- Prior runtime revision: `sha256:b9a7646d16f9276b19bf007585afac6f1679294fcd81de8376cc82031ea4c852`.
- Final native objective: generation 4, ordinal 5, `passed`.
- Final runtime status revision: `sha256:b9e747742c727478fbdb349e6a356cb608dfacb3e9b790cccc35df67da57ff7f`.
- Final evidence revision: `sha256:1ddcc13f77a37dc6d169dc1718039c5ebad9fce9904c1467b605688471b1d7e8`.
- Parent-owned runtime attempt for PR 2 / task 1.2 settled `passed` / `complete` after the sdd-apply worker returned; evidence revision: `sha256:af40086ea6efab7804cabc151f646055ee1ebec46993959256c9c157fce57044`.
- Prior assigned scope: narrow task 2.1 correction only, based on exact head `1f7f78f`.
- Delivery: `ask-on-risk` resolved as one isolated `stacked-to-main` slice; candidate commits `a0618fe`, `1ce172b`, and `2a8fc88` exist; no push, PR, deployment, controls, provider, KV, API handler, frontend integration, or later-slice work.
- Changed-line limit: 400 authored additions + deletions.
- Prior correction authorization: hard-cap public limits at K=3, deterministic non-finite limits fail closed, and isolate English/PT alias-only fixtures.

## Task Status

- [x] 1.1 Contracts and foundation — implementation and required evidence complete.
- [x] 1.2 Knowledge governance — implementation and required evidence complete.
- [x] 2.1 Grounded retrieval — implementation and required evidence complete.
- [x] 2.2 Grounded output validation — implementation and required evidence complete.
- [ ] 2.3+ — all later tasks remain pending.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 1.1 | `packages/contracts/chat.test.ts` | Unit | ✅ Existing contract safety net completed | ✅ Added invalid result-code, exact source URL, and contract-boundary assertions first | ✅ Focused contract tests 17/17 passed | ✅ Supported languages, failure invariants, invalid codes, URL policy, and manifests | ✅ Exported result-code schema, removed obsolete Zod type assertion, tightened URL policy |
| 1.2 | `packages/knowledge/knowledge.test.ts` | Unit | ✅ New files; no existing knowledge tests | ✅ Wrote governance and future-date regressions before production corrections | ✅ Focused knowledge tests 12/12 passed | ✅ Approved fixture, timestamp ordering, duplicate IDs, unsafe URLs, and freshness branches | ✅ Extracted schemas and narrowed approved repository output; tests remained green |
| 2.2 | `chat-api/validation.test.ts` | Unit | ✅ New validation files; no existing validation tests | ✅ Added six adversarial/grounding cases before implementation; import failure confirmed | ✅ Focused validation tests 6/6 passed | ✅ Injection, conflicting price, unsupported claim, unknown URL, Portuguese paraphrase, and no-URL evidence | ✅ Extracted safe-result, grounding, source, and URL checks; tests remained green |

## Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command and exact result | `npm test -- packages/contracts/chat.test.ts` — 17/17 passed |
| Runtime harness command/scenario and exact result | Native objective generation 4, ordinal 5 — `passed`; full suite 3 files, 62/62 passed; `npx tsc --noEmit` passed; `npm run build` passed with 21/21 pages generated; `git diff --check` passed; no stale Next/Vitest processes remained |
| Rollback boundary | Revert `packages/contracts/chat.ts`, `packages/contracts/chat.test.ts`, root `package.json`/`package-lock.json` contract-boundary changes, and these two bookkeeping artifacts; leave unrelated worktree changes intact. This boundary does not include task 1.2 or any later slice. |
| Focused test command and exact result | `npx vitest run packages/knowledge/knowledge.test.ts` — 12/12 passed |
| Runtime harness command/scenario and exact result | Parent-owned native runtime attempt for PR 2 / task 1.2 settled `passed` / `complete` after the sdd-apply worker returned; evidence revision `sha256:af40086ea6efab7804cabc151f646055ee1ebec46993959256c9c157fce57044`. Within that attempt, `npm run build` passed; static build compiled and generated 21/21 pages. |
| Rollback boundary | Revert only `packages/knowledge/knowledge.test.ts`, `packages/knowledge/types.ts`, `packages/knowledge/fixtures/v1.ts`, `packages/knowledge/package.json`, the corresponding root `package-lock.json` workspace records, this progress artifact, and the task 1.2 checkbox; leave task 1.1 and unrelated worktree changes intact. |

## Additional Checks

- Focused contract tests — 17/17 passed.
- Full suite — 3 files, 62/62 passed.
- `npx tsc --noEmit` — passed.
- `npm run build` — passed; 21/21 pages generated.
- `git diff --check` — passed.
- No stale Next/Vitest processes remained.
- Direct Node contract smoke — passed: valid SUCCESS parses; query-bearing source URL and invalid result code reject.
- Full suite — `npm test -- --run` — 4 files, 74/74 passed.
- Typecheck — `npx tsc --noEmit` — passed.
- Static build — `npm run build` — passed; 21/21 pages generated.
- Diff validation — `git diff --check` — passed.
- Authored changed lines — 233 total: 228 additions and 5 deletions, including dependency ownership and task/progress bookkeeping (under 400-line slice maximum); implementation/test files contribute 189 additions.

## Task 2.2 Slice

- Assigned scope: task 2.2 only; isolated stacked-to-main slice targeting `main` after verification.
- Implementation: `chat-api/validation.ts` validates strict provider shape, requested language, grounded sentence anchors, approved evidence IDs/titles/URLs, canonical links, and numeric claims; injection, malformed, unsupported, and conflicting output fails closed to the localized unknown result.
- No task 2.3 controls/config/CORS/privacy, task 2.4 provider, task 3.1 handler, frontend, or release work was implemented.

## TDD Cycle Evidence (Task 2.2)

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 2.2 | `chat-api/validation.test.ts` | Unit | ✅ New files; no existing validation tests | ✅ Six cases written first; missing module failed before production code | ✅ 6/6 focused tests passed | ✅ Six cases cover all assigned adversarial fixtures and both URL branches | ✅ Helper extraction and type-safe success narrowing; focused tests remained green |

## Work Unit Evidence (Task 2.2)

| Evidence | Result |
|---|---|
| Focused test command and exact result | `npx vitest run chat-api/validation.test.ts` — 1 file, 6/6 passed. |
| Full test command and exact result | `npm test -- --run` — 6 files, 99/99 passed. |
| Typecheck command and exact result | `npx tsc --noEmit` — passed. |
| Build command and exact result | `npm run build` — passed; 21/21 static pages generated. |
| Runtime harness command/scenario and exact result | N/A — pure validation over governed in-memory evidence; no provider, API handler, KV, credentials, or network boundary exists in task 2.2. |
| Rollback boundary | Revert only `chat-api/validation.ts`, `chat-api/validation.test.ts`, this task 2.2 checkbox, and the task 2.2 progress sections; leave tasks 1.1–2.1 and tasks 2.3+ untouched. |
| Diff validation | `git diff --check` — passed. |
| Authored line count | 188 changed lines: 181 additions and 7 deletions; hard 400-line limit respected. |

## Deviations and Risks (Task 2.2)

- Deviations: None — implementation matches the design's fail-closed, evidence-only boundary. Provider/API handler/control concerns remain out of scope.
- Risks: grounding uses conservative token anchors and numeric-presence checks; semantic model evaluation remains a later provider/handler concern.

## Status

Tasks 1.1, 1.2, 2.1, and 2.2 are complete and ready for the next independent SDD verification/review/delivery step. Tasks 2.3–4.3 remain pending. No push, PR, or receipt was created.

## Task 2.1 Slice

- Assigned scope: task 2.1 only; stacked-to-main slice targeting `main` after verification.
- Implementation: deterministic lexical retrieval with Unicode/diacritic normalization, multilingual aliases, weighted term-frequency scoring, threshold fail-closed behavior, bounded K=3 results, and deterministic version/freshness/ID tie-breaking.
- No task 2.2 validation, API controls, providers, handlers, frontend, or release work was implemented.

## TDD Cycle Evidence (Task 2.1)

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 2.1 | `packages/knowledge/retriever.test.ts` | Unit | ✅ Prior retriever baseline 14/14 passed | ✅ Added limit and isolated English/PT alias tests before production edits; 2 failures confirmed | ✅ 19/19 passed after K=3 cap and finite-limit guard | ✅ Existing governance, threshold, ties, ambiguity, and normalization cases retained; 19/19 green |

## Work Unit Evidence (Task 2.1)

| Evidence | Result |
|---|---|
| Focused test command and exact result | `npx vitest run packages/knowledge/retriever.test.ts` — 1 file, 19/19 passed; RED was 2/19 before production edits. |
| Runtime harness command/scenario and exact result | `npm test` — 5 files, 93/93 passed; `npx tsc --noEmit` passed; `npm run build` generated 21/21 static pages; `git diff --check` passed; provider/API harness N/A — pure in-memory retrieval. |
| Rollback boundary | Revert only the three retriever files changed by this correction; leave task 2.1 prior behavior, tasks 1.1/1.2, and later work untouched. |
| Correction count and cumulative diff | Relative to `1f7f78f`: 49 native-measured changed lines (37 additions, 12 deletions), explicitly approved by the maintainer. Final cumulative diff from `main`: 340 additions, 7 deletions (347 changed lines). |

## Additional Checks (Task 2.1)

- Focused retrieval tests — 19/19 passed (RED 2 failures, then GREEN 19/19).
- Full suite — `npm test`: 5 files, 93/93 passed.
- Typecheck — `npx tsc --noEmit` passed.
- Static build — `npm run build` passed; 21/21 pages generated.
- Diff validation — `git diff --check` passed.
- No live provider, KV, credentials, or network harness was required for this pure retrieval slice.

## Authorized Scoped Correction (Task 2.1)

- Findings corrected: public limit cap/non-finite fail-closed behavior and independently proven English/PT aliases. RED: 2 focused failures before production edits. GREEN: 19/19 focused after correction. Rollback: revert the three retriever files only; prior/later tasks remain untouched.

## Current Status

Tasks 1.1, 1.2, 2.1, and 2.2 are complete. Tasks 2.3–4.3 remain pending. Task 2.2 validation is uncommitted by instruction; no stage, commit, push, PR, or receipt was created. Ready for independent verification.

## Authorized Scoped Correction (Task 2.2)

- Scope: one authorized correction transaction for task 2.2 only, relative to frozen initial commit `b620f64`; no task 2.3+ implementation.
- Findings corrected: semantic inversion/negation and unsupported claims; punctuation-resistant structural injection detection; exact numeric comparison and conflicting approved-price rejection; answer grounding bound to cited evidence; strict rejection of unknown provider top-level fields; direct `@ijac/knowledge: 0.1.0` ownership in `chat-api` and lockfile, with no version change.
- TDD RED: added 7 regression assertions covering the admitted critical findings and warnings; focused run failed 5/13 before production changes.
- TDD GREEN: focused validation run passed 13/13 after the minimum validation changes.
- Triangulation: English negation, Portuguese unsupported claim, punctuation injection, exact 9-vs-90 numeric distinction, conflicting approved prices, citation mismatch, unknown top-level field, existing six adversarial cases, and grounded Portuguese/no-URL acceptance.

## TDD Cycle Evidence (Scoped Correction)

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 2.2 correction | `chat-api/validation.test.ts` | Unit | ✅ Existing baseline 6/6 | ✅ 5/13 failed before production edits | ✅ 13/13 passed | ✅ Critical and warning matrix cases plus preserved ES/EN/PT and no-URL behavior | ✅ Structural token checks, exact numeric values, cited-entry binding; 13/13 remained green |

## Work Unit Evidence (Scoped Correction)

| Evidence | Result |
|---|---|
| Focused test command and exact result | `npx vitest run chat-api/validation.test.ts` — 1 file, 13/13 passed. |
| Runtime harness command/scenario and exact result | N/A — pure in-memory validation; no provider, API handler, KV, credential, or network boundary exists in task 2.2. |
| Rollback boundary | Revert only `chat-api/validation.ts`, `chat-api/validation.test.ts`, `chat-api/package.json`, the matching `package-lock.json` workspace ownership record, and this correction evidence; leave tasks 1.1–2.1 and 2.3+ untouched. |
| Full test command and exact result | `npm test -- --run` — 6 files, 106/106 passed. |
| Typecheck/build/diff command results | `npx tsc --noEmit` passed; `npm run build` passed with 21/21 static pages; `git diff --check` passed. |
| Correction count | Native `git diff --numstat b620f64`: 82 additions + 12 deletions = 94; hard maximum respected. |

## Deviations and Risks (Scoped Correction)

- Deviations: none from the authorized correction boundary; validation remains deterministic and fail-closed.

## Cumulative Status After Scoped Correction

Tasks 1.1, 1.2, 2.1, and 2.2 remain checked; tasks 2.3–4.3 remain pending. No stage, commit, push, PR, receipt, provider, controls, handler, frontend, or release work was performed.

## Authorized Narrow Correction: Task 2.2 Role Inversion

- Scope: task 2.2 only, authorized correction relative to exact head `6d3f006`; task 2.3+ remains untouched.
- RED: added a failing token-preserving subject/object role-inversion regression and a valid subject-led paraphrase control; focused result was 1 failure / 15 tests before production edits.
- GREEN: deterministic claim-order guard rejects the inversion while preserving the control and existing ES/EN/PT, citation, numeric, injection, URL, and safe-fallback behavior.
- Conservative scope: this is not general semantic entailment; it only rejects a cited claim's recognized `iJAC` subject role when the same role verb appears before `iJAC` in the answer.
- Exact correction count relative to `6d3f006`: 25 implementation additions, 0 deletions; 37 additions, 0 deletions including this bookkeeping update. Final cumulative diff from `main`: 290 additions, 9 deletions (299 changed lines).
- TDD cycle: RED written first; GREEN focused validation passed; triangulation retained the valid paraphrase and prior multilingual/adversarial cases; refactor extracted ordered-token/role checks.
- Work unit evidence: focused tests, full tests, typecheck, build, and diff check are recorded in the final verification section below.
- Rollback: revert only `chat-api/validation.ts`, `chat-api/validation.test.ts`, and this narrow correction section; preserve all prior task 1.1–2.1 and task 2.3+ artifacts.
- Current commit state: branch `feat/chatbot-stage2-validation`; correction commit `f4d1aae` exists locally; no push, PR, install, or remote change.
