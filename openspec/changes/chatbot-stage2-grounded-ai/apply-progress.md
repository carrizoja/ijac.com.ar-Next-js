# Apply Progress: `chatbot-stage2-grounded-ai`

## Reconciled Recovery History

- Prior recovery objective: bounded recovery generation 2, ordinal 3.
- Prior runtime revision: `sha256:b9a7646d16f9276b19bf007585afac6f1679294fcd81de8376cc82031ea4c852`.
- Final native objective: generation 4, ordinal 5, `passed`.
- Final runtime status revision: `sha256:b9e747742c727478fbdb349e6a356cb608dfacb3e9b790cccc35df67da57ff7f`.
- Final evidence revision: `sha256:1ddcc13f77a37dc6d169dc1718039c5ebad9fce9904c1467b605688471b1d7e8`.
- Parent-owned runtime attempt for PR 2 / task 1.2 settled `passed` / `complete` after the sdd-apply worker returned; evidence revision: `sha256:af40086ea6efab7804cabc151f646055ee1ebec46993959256c9c157fce57044`.
- Assigned and authorized scope: PR 2 / task 1.2 only, based on merged PR 1 commit `fd17435215cfcd19014ede1b445948bf09563f7f`.
- Delivery: `auto-chain`, `stacked-to-main`; no commit, branch, PR, push, deployment, provider, KV, retrieval, API handler, frontend integration, or later-slice work.
- Changed-line limit: 400 authored additions + deletions.
- Recovery resolution: the prior single failure was caused by a malformed missing-language test fixture; production schema already required `language`, and the fixture was corrected with a one-line test-fixture change.

## Task Status

- [x] 1.1 Contracts and foundation — implementation and required evidence complete.
- [x] 1.2 Knowledge governance — implementation and required evidence complete.
- [x] 2.1 Grounded retrieval — implementation and required evidence complete.
- [ ] 2.2+ — all later tasks remain pending.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 1.1 | `packages/contracts/chat.test.ts` | Unit | ✅ Existing contract safety net completed | ✅ Added invalid result-code, exact source URL, and contract-boundary assertions first | ✅ Focused contract tests 17/17 passed | ✅ Supported languages, failure invariants, invalid codes, URL policy, and manifests | ✅ Exported result-code schema, removed obsolete Zod type assertion, tightened URL policy |
| 1.2 | `packages/knowledge/knowledge.test.ts` | Unit | ✅ New files; no existing knowledge tests | ✅ Wrote governance and future-date regressions before production corrections | ✅ Focused knowledge tests 12/12 passed | ✅ Approved fixture, timestamp ordering, duplicate IDs, unsafe URLs, and freshness branches | ✅ Extracted schemas and narrowed approved repository output; tests remained green |

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

## Status

Tasks 1.1, 1.2, and 2.1 are complete and ready for the next independent SDD verification/review/delivery step. Tasks 2.2+ remain pending.

## Task 2.1 Slice

- Assigned scope: task 2.1 only; stacked-to-main slice targeting `main` after verification.
- Implementation: deterministic lexical retrieval with Unicode/diacritic normalization, multilingual aliases, weighted term-frequency scoring, threshold fail-closed behavior, bounded K=3 results, and deterministic version/freshness/ID tie-breaking.
- No task 2.2 validation, API controls, providers, handlers, frontend, or release work was implemented.

## TDD Cycle Evidence (Task 2.1)

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 2.1 | `packages/knowledge/retriever.test.ts` | Unit | ✅ `packages/knowledge/knowledge.test.ts` baseline 12/12 passed | ✅ Added 8 retrieval tests and fixtures before `retriever.ts`; missing-module failure confirmed | ✅ 8 cases cover normalization, multilingual aliases, all field weights, K=3, threshold, ties, unrelated, and ambiguity; final focused run 8/8 passed | ✅ Extracted tokenization/scoring/comparison helpers and constants; final focused run remained 8/8 |

## Work Unit Evidence (Task 2.1)

| Evidence | Result |
|---|---|
| Focused test command and exact result | `npx vitest run packages/knowledge/retriever.test.ts` — 1 file, 8/8 tests passed |
| Runtime harness command/scenario and exact result | `npm test` — 5 files, 82/82 passed; `npx tsc --noEmit` passed; `npm run build` passed with 21/21 static pages generated; `git diff --check` passed. Runtime provider/API harness: N/A — task 2.1 is pure in-memory retrieval with no runtime boundary, credentials, network, provider, or KV integration. |
| Rollback boundary | Revert `packages/knowledge/retriever.ts`, `packages/knowledge/retriever.test.ts`, `packages/knowledge/fixtures/retriever.ts`, the `packages/knowledge/package.json` retriever export, this task checkbox, and this task 2.1 progress section; leave tasks 1.1/1.2 and later work untouched. |
| Final authored changed-line count | 272 total: 268 additions and 4 deletions, including task/progress bookkeeping; under the 400-line isolated-slice limit. |

## Additional Checks (Task 2.1)

- Focused retrieval tests — 8/8 passed.
- Full suite — 5 files, 82/82 passed.
- Typecheck — `npx tsc --noEmit` passed.
- Static build — `npm run build` passed; 21/21 pages generated.
- Diff validation — `git diff --check` passed.
- No live provider, KV, credentials, or network harness was required for this pure retrieval slice.

## Current Status

Tasks 1.1, 1.2, and 2.1 are complete. Tasks 2.2–4.3 remain pending. This slice is ready for independent verification/review; no commit, push, PR, or receipt was created.
