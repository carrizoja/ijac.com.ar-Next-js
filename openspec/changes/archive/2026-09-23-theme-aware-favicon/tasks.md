## 1. Failing Contract Tests

- [x] 1.1 Extend the shared document tests to require an unconditional current-favicon link followed by light- and dark-scheme favicon links with accurate URLs, media conditions, and MIME types.
- [x] 1.2 Add coverage proving both Spanish and English root layouts receive the same shared favicon contract while existing Apple touch and manifest icon behavior remains unchanged, then record the expected failing test result before implementation.

## 2. Favicon Implementation

- [x] 2.1 Create the dark favicon from the approved negative iJAC logo source, place it at the stable public URL selected by the tests, and verify its format, dimensions, transparency, and legibility at favicon size.
- [x] 2.2 Add the ordered fallback, light-scheme, and dark-scheme `rel="icon"` declarations to the shared document head without changing the in-page theme toggle, locale metadata, manifest, or Apple touch icon declarations.
- [x] 2.3 Run the focused favicon/document tests to green and refactor only if needed while preserving the declarative shared-head approach.

## 3. Static Export Verification

- [x] 3.1 Run the full test suite and lint checks, resolving only regressions caused by this change.
- [x] 3.2 Produce a production static export and verify that both `/` and `/en` HTML contain the expected favicon link order and that all referenced light, dark, fallback, manifest, and Apple icon assets resolve.
- [x] 3.3 Smoke-test favicon selection in light and dark OS/browser modes with a clean favicon cache, and confirm that a client ignoring media-specific favicon links can still use the current favicon.

## 4. Delivery Checkpoint

- [x] 4.1 Confirm the authored implementation diff remains within the fixed 400 changed-line review budget; under the `ask-on-risk` strategy, pause for a chain-strategy decision before delivery only if the forecast or running count exceeds that budget.
