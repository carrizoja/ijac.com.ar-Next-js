# Tasks

Strict TDD: write the test first and watch it fail before implementing.

## 1. Policy section

- [x] 1.1 Add failing tests in `src/app/(es)/politica-de-privacidad/page.test.tsx` for each fact in the spec and for the heading order 1–8. Verify: all go red.
- [x] 1.2 Add the section, read storage keys and footer labels from the shared modules, renumber sections 5–8. Verify: the test file passes.

## 2. Documentation and build verification

- [x] 2.1 Update `GOOGLE-ANALYTICS-SETUP.md` → Known gaps. Verify: the list matches the shipped code.
- [x] 2.2 Run `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Verify: all clean.
- [x] 2.3 Confirm the copy is in `out/politica-de-privacidad/index.html`, and that metadata, `sitemap.xml` and `robots.txt` match the pre-change build. Verify: grep and diff output.
