# Tasks

Strict TDD: for every behavior below, write the test first and watch it fail before implementing.

## 1. Shared contract in `src/app/lib/consent.ts`

- [x] 1.1 Add failing tests in `src/app/lib/consent.test.ts`: `requestConsentWithdrawal()` dispatches `CONSENT_WITHDRAW_EVENT` on `window` exactly once and does not throw without a `window`; the script assigns `window.__ijacExpireAnalyticsCookies`; a non-accepted visitor still gets both the deny default and the expiry call. Verify: `npx vitest run src/app/lib/consent.test.ts` goes red for the new cases.
- [x] 1.2 Implement `CONSENT_WITHDRAW_EVENT`, `requestConsentWithdrawal()`, and the `declare global` typing for `window.__ijacExpireAnalyticsCookies`. Verify: the same test file passes.
- [x] 1.3 Restructure `CONSENT_SCRIPT_PARTS` so the expiry loop is declared once as `expireGaCookies`, exposed on `window.__ijacExpireAnalyticsCookies`, and called for non-accepted visitors — keeping literal parts with `.join("")` and the `__CONSENT_KEY__` / `__CONSENT_ACCEPTED__` / `__GA_COOKIE__` tokens. Verify: `npx vitest run src/app/lib/consent.test.ts src/app/components/SiteDocument.consent.test.tsx` passes, and the script text still contains one deny default and no truncation.

## 2. Footer withdrawal control

- [x] 2.1 Add failing tests in `src/app/components/Footer.test.tsx`: the Spanish footer shows a `Configurar cookies` button and the English footer shows `Cookie settings`; it is a `button` with `type="button"`, not a link; clicking it dispatches `CONSENT_WITHDRAW_EVENT` on `window`. Verify: the file goes red before the change.
- [x] 2.2 Add `cookieSettingsLabel` to `FooterContent` in `src/i18n/chrome/footer.ts` for `es` and `en` (site copy stays Spanish/English as-is). Verify: `npx tsc --noEmit` accepts both locale objects as complete.
- [x] 2.3 Render the control in `Footer.tsx`'s copyright block, styled as a subtle link-style button consistent with the surrounding text, wired to `requestConsentWithdrawal`. Verify: `npx vitest run src/app/components/Footer.test.tsx` passes.

## 3. Banner withdrawal behavior

- [x] 3.1 Add failing tests in `src/app/components/CookieConsent.test.tsx`: an `accepted` visitor whose banner is hidden receives `CONSENT_WITHDRAW_EVENT` → `gtag('consent','update',…denied)`, `window.__ijacExpireAnalyticsCookies` called, `cookie-consent` and `cookie-consent-date` removed, banner visible; the same on a legal page; the same when `localStorage.removeItem` throws; and `Rechazar` on a banner reopened after an accept expires the cookies too. Verify: the file goes red.
- [x] 3.2 Implement the withdrawal handler in `CookieConsent.tsx` in the D4 order (deny → expire → clear storage in `try/catch` → show), subscribing and unsubscribing on mount. Verify: `npx vitest run src/app/components/CookieConsent.test.tsx` passes and no listener leaks between tests.
- [x] 3.3 Make an explicit withdrawal show the banner on legal pages via the `requested` flag, without changing the first-visit suppression. Verify: the legal-page scenarios in `CookieConsent.test.tsx` pass, and a first visit to a legal page still renders no banner.

## 4. Documentation and build verification

- [x] 4.1 Document the withdrawal flow and its live verification steps in `GOOGLE-ANALYTICS-SETUP.md`: footer control in both locales, deny → expire → forget → banner, the `window.__ijacExpireAnalyticsCookies` contract, and what a blocked head script does and does not cover. Verify: the documented commands and selectors match the shipped code.
- [x] 4.2 Run `npm test`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Verify: all clean and 32 routes emitted as before.
- [x] 4.3 Inspect the built HTML for `out/index.html`, `out/en/index.html` and `out/404.html`: the bootstrap defines `__ijacExpireAnalyticsCookies`, keeps all four denied keys, and is not truncated; the footer control markup and both labels are present. Verify: `grep` output shows each marker and the script's closing braces after the last `if(`.
- [x] 4.4 Re-check SEO parity against the pre-change build: `robots.txt` and `sitemap.xml` unchanged except `<lastmod>`, and `<title>`, `<meta>` and `hreflang` unchanged on `/`, `/en/` and `404`. Verify: diff of the extracted tags is empty.
- [x] 4.5 Verify with headless Chrome on the built export, for both locales: accept (cookies appear) → activate the footer control → no `_ga`/`_ga_*` cookie in `document.cookie`, `cookie-consent` gone, banner visible → accept again → cookies return; and on a legal page the control shows the banner. Verify: the script's JSON output reports the expected cookie lists at each step.

## Workflow follow-up

- Open the PR from a `feat/` branch with the verification evidence.
- Deploy with `npm run deploy -- --live` and repeat the `document.cookie` check on `https://ijac.com.ar`.
- Archive the change once merged.
