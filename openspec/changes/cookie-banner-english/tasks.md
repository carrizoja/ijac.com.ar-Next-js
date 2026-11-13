# Tasks

Strict TDD: write the test first and watch it fail before implementing.

## 1. Banner copy

- [x] 1.1 Add failing tests in `src/app/components/CookieConsent.test.tsx`: on `/en/` the banner shows "🍪 Use of Cookies", "Accept Cookies" and "Reject", links keep the Spanish legal URLs, and both English buttons store and apply the choice; on `/` the Spanish body text matches the pre-change text exactly. Verify: the English cases go red.
- [x] 1.2 Add `src/i18n/chrome/cookie-consent.ts` with typed `es`/`en` copy, Spanish copied verbatim from the component. Verify: `npx tsc --noEmit` accepts both locale objects.
- [x] 1.3 Read the copy in `CookieConsent.tsx` via `getLocaleFromPath(usePathname())`. Verify: `npx vitest run src/app/components/CookieConsent.test.tsx` passes.

## 2. Documentation and build verification

- [x] 2.1 Update `GOOGLE-ANALYTICS-SETUP.md` → Known gaps. Verify: the remaining gap list matches the shipped code.
- [x] 2.2 Run `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Verify: all clean.
- [x] 2.3 Check SEO parity against the pre-change build (`robots.txt`, `sitemap.xml` except `<lastmod>`, `<title>`/`<meta>`/`hreflang` on `/`, `/en/`, 404). Verify: diff empty.
- [x] 2.4 Spot-check the built export in headless Chrome: `/en/` shows the English banner, `/` the Spanish one. Verify: screenshot/snapshot text.
