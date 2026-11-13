# Design

## Context

See proposal.md (Why). The relevant facts in the code today:

- `SiteDocument.tsx` (shared by `(es)/layout.tsx`, `en/layout.tsx`, and `global-not-found.tsx`) loads `gtag/js` and an inline init (`gtag('js')`, `gtag('config', 'G-8NYPRQK16F')`) with `next/script` `strategy="lazyOnload"`. It has no `consent default`.
- `CookieConsent.tsx` writes `cookie-consent` = `accepted` | `rejected` to localStorage and calls `window.gtag('consent', 'update', …)` only `if (window.gtag)`. Before GA loads, `window.gtag` is undefined, so an early click is dropped.
- `<head>` already holds one synchronous inline script, `themeBootstrapScript` from `src/app/lib/theme.ts`: a try/catch-wrapped string rendered with `dangerouslySetInnerHTML`, tested in `theme.test.ts` and `SiteDocument*.test.tsx`.
- `GoogleAnalytics.tsx` has a `denied` default but nothing imports it.
- The site is a static export on Hostinger: no server, middleware, or headers from Next.

## Goals / Non-Goals

**Goals:**
- Consent default applied before any gtag command, from static HTML.
- One GA initialization path, testable as a plain string like the theme bootstrap.
- Early banner clicks queue correctly.

**Non-Goals:**
- Banner redesign, English banner copy, legal-page localization, "change cookie settings" control.
- Moving to Google Tag Manager or a consent-management platform.
- Changing the GA load strategy (`lazyOnload` stays).

## Decisions

### D1. Consent Mode v2 "advanced" (load gtag, default denied) over "basic" (don't load until accepted)
Keep loading `gtag/js` for everyone with storage denied. Google then receives cookieless pings and can model conversions, while no cookies are set without consent.
- *Alternative, basic mode:* inject `gtag/js` only after "accepted". This is stricter (no request to Google at all before consent) but needs a client component that loads the script conditionally, and it loses modeled data. Switching later only changes when the script is injected, so the spec still holds.

### D2. Synchronous inline `<head>` bootstrap, a sibling of the theme script
Add `src/app/lib/consent.ts` that exports the storage key and values (`CONSENT_STORAGE_KEY = 'cookie-consent'`, `'accepted' | 'rejected'`) and `consentBootstrapScript`. The script:
```js
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=window.gtag||gtag;
gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',
  ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});
try{if(localStorage.getItem('cookie-consent')==='accepted')
  gtag('consent','update',{analytics_storage:'granted'});}catch(e){}
```
Render it in `<head>` with `dangerouslySetInnerHTML`, right after `themeBootstrapScript`. The `lazyOnload` init then keeps only `gtag('js')` and `gtag('config')`.
- *Why inline and synchronous:* it runs before any `lazyOnload` script and is in the exported HTML (spec: "in the static HTML"). A `next/script` `beforeInteractive` would also work, but this project already uses the inline-string pattern, and a plain string is unit-testable without a browser.
- *Why define `window.gtag` early:* the banner's existing `if (window.gtag)` guard then always passes, so a click before GA loads is queued in `dataLayer` (spec: "Accept before GA has loaded"). `CookieConsent.tsx` needs no logic change, only the shared constants.
- *Ads keys denied:* the site runs no ads. Declaring them anyway satisfies Consent Mode v2 and avoids surprises if Ads is linked later. Ads keys are never granted (only analytics).

```
 HTML parse                       after load (lazyOnload)          click
 ─────────────────────────────▶  ───────────────────────────────▶ ─────────▶
 theme bootstrap                  gtag/js arrives                   Aceptar
 consent bootstrap ──▶ dataLayer: [default denied, (update granted)?,
                                   js, config]                      update granted
```

### D3. Delete `GoogleAnalytics.tsx`
It has no importers. Keeping it leaves a second, contradictory init path that someone could later mount and get duplicate `config` hits.

## Risks / Trade-offs

- [GA visit counts drop for denied visitors] → Expected and correct. Note it in `GOOGLE-ANALYTICS-SETUP.md` so the drop isn't misread as a bug.
- [Inline script must stay first and synchronous] → A test asserts the consent default comes before `gtag('config'` in the rendered `SiteDocument` markup.
- [`PerformanceMonitor` events fire while denied] → They are sent as cookieless pings like any other event, which is allowed under advanced mode. No change.
- [Hostinger CSP could later block inline scripts] → There's no CSP today, and the theme bootstrap has the same dependency. If a CSP is added, both need a hash.

## Migration Plan

1. Ship as one commit and deploy with `npm run deploy -- --live`.
2. Verify on production with DevTools: as a first visit (cleared storage), `dataLayer[0]` is the denied default and there's no `_ga` cookie. After "Aceptar Cookies", `_ga` appears. After "Rechazar" plus a reload, there's no `_ga`. GA4 Realtime still shows accepted sessions.
3. Rollback: revert the commit and redeploy. There's no stored-data migration; the localStorage keys are unchanged.
