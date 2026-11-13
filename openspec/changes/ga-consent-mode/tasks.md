# Tasks

Strict TDD: for each task, write the failing test first and observe RED before implementing.

## 1. Consent bootstrap module

- [ ] 1.1 Add `src/app/lib/consent.test.ts` (RED): evaluate `consentBootstrapScript` against a fake `window`/`localStorage` and assert (a) with no stored value, `dataLayer[0]` is `['consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',…}]` and there is no `update`; (b) with `accepted`, the next entry is `update` with `analytics_storage:'granted'`; (c) with `rejected`, there is no `update`; (d) when `localStorage.getItem` throws, the default is still pushed and nothing throws; (e) `window.gtag` is defined afterwards. Verify: `npx vitest run src/app/lib/consent.test.ts` fails.
- [ ] 1.2 Create `src/app/lib/consent.ts` exporting `CONSENT_STORAGE_KEY`, `CONSENT_ACCEPTED`, `CONSENT_REJECTED`, and `consentBootstrapScript` per design D2. Verify: 1.1 passes.

## 2. Wire the bootstrap into the document

- [ ] 2.1 Add `src/app/components/SiteDocument.consent.test.tsx` with `// @vitest-environment jsdom` (RED). Don't extend `SiteDocument.test.tsx`: it runs in the node environment and never renders, and `SiteDocument.favicon.test.tsx` mocks `next/script` without children. Mock `next/font/google`, and mock `next/script` so it renders its children. Render for `locale="es"` and `locale="en"` and assert: the `<head>` contains the consent bootstrap after the theme bootstrap; the `lazyOnload` GA init contains `gtag('config'` and no longer defines `dataLayer`/`gtag` itself. Don't assert markup order against `gtag('config'` — see 5.2 for why that passes trivially. Verify: the test fails.
- [ ] 2.2 Render `consentBootstrapScript` in `<head>` of `SiteDocument.tsx` right after `themeBootstrapScript`, and reduce the `google-analytics` inline script to `gtag('js', new Date()); gtag('config', …)`. Verify: 2.1 and the existing `SiteDocument*.test.tsx` pass.

## 3. Banner uses the shared contract

- [ ] 3.1 Extend `CookieConsent.test.tsx` (RED): with `window.gtag` stubbed as a spy, clicking "Aceptar Cookies" stores `accepted` and calls `gtag('consent','update',{analytics_storage:'granted'})`; clicking "Rechazar" stores `rejected` and calls the update with `denied`. Keep the four existing banner tests unchanged. Verify: the new tests fail only if behavior differs. If they pass on the current code, record that as a regression pin, not RED.
- [ ] 3.2 Replace the `'cookie-consent'` and value literals in `CookieConsent.tsx` with the constants from `src/app/lib/consent.ts`. No behavior or copy change. Verify: `npx vitest run src/app/components/CookieConsent.test.tsx` passes.
- [ ] 3.3 Guard the banner's storage access (RED first). Extend `CookieConsent.test.tsx` with a `localStorage` stub whose `getItem`/`setItem` throw: rendering must not throw, and a click must not throw. Then wrap the banner's reads and writes in `try/catch` so blocked storage fails closed (no stored choice, analytics stays denied) instead of unmounting the tree. Verify: `npx vitest run src/app/components/CookieConsent.test.tsx` passes.

## 4. Remove the dead GA path and document

- [ ] 4.1 Delete `src/app/components/GoogleAnalytics.tsx`. Verify: `grep -rn "GoogleAnalytics\|GoogleTagManager" src` finds nothing, and `npx tsc --noEmit` passes.
- [ ] 4.2 Update `GOOGLE-ANALYTICS-SETUP.md`: Consent Mode v2 advanced, the default-denied behavior, stored-choice restoration, the cookie-level scope (cookieless pings still reach Google), the expected drop in visit counts, the legacy-cookie behavior from 5.4, and the DevTools verification steps from design (Migration Plan step 2). Verify: the doc reads correctly and its code snippets match `SiteDocument.tsx`.

## 5. Full verification

- [ ] 5.1 Run `npm test`, `npm run lint`, and `npx tsc --noEmit`. All pass.
- [ ] 5.2 Run `npm run build`. In `out/index.html`, `out/en/index.html`, and `out/404.html`, the `<head>` contains a real inline `<script>` whose text includes the consent default. Don't assert textual order against `gtag('config'`: the GA init is not emitted as a `<script>` in the static HTML (it exists only in the RSC flight payload and runs after hydration), so such an assertion passes trivially. Diff `out/sitemap.xml`, `out/robots.txt`, and the JSON-LD/`<meta>`/hreflang tags of `/` and `/en/` against a build of the base commit: they're identical (spec: "Build output parity").
- [ ] 5.3 Browser check on `npm run dev` or the built `out/`, reading `document.cookie` (not DevTools eyeballing). Four cases:
  - storage cleared, load → no `_ga` cookie
  - storage cleared, "Aceptar Cookies" → `_ga` appears
  - `cookie-consent=rejected`, reload → no `_ga`, banner stays hidden
  - `_ga`/`_ga_*` seeded by hand plus `cookie-consent=rejected`, reload → no `_ga` cookie (feeds 5.4)
- [ ] 5.4 Decide the legacy-cookie behavior from 5.3's last case. If the seeded `_ga`/`_ga_*` cookies survive a rejected page load, add cleanup to the consent bootstrap (explicit expiry for `_ga` and `_ga_*`, matched on domain and path) plus a test, because the spec now requires the cookie to be *present*-free after a rejected load. If Consent Mode already clears them, record that in `GOOGLE-ANALYTICS-SETUP.md` and close this task.

## Workflow follow-up

- Deploy with `npm run deploy -- --live` (a user decision), then repeat 5.3 and 5.4 on https://ijac.com.ar and confirm accepted sessions in GA4 Realtime.
- Archive with `/opsx:archive ga-consent-mode` after deploy verification.
