# Proposal

## Why

The cookie banner offers "Rechazar", but Google Analytics (`G-8NYPRQK16F`) loads and sets its cookies on every visit regardless of the choice. `SiteDocument.tsx` initializes gtag without a consent default, so the banner's `gtag('consent', 'update', …)` calls change nothing for a visitor who rejects, and a returning visitor's stored choice is never re-applied. The site therefore tracks visitors who explicitly declined, which contradicts the privacy policy the banner links to.

## What Changes

- Declare a Google Consent Mode v2 default of `denied` for all storage types before any gtag command runs, on every page of both locales.
- Re-apply a returning visitor's stored choice (`localStorage['cookie-consent']`) before GA loads, so an earlier "accept" restores measurement and an earlier "reject" stays denied.
- Keep the banner's accept/reject actions updating consent at runtime; reject leaves analytics denied.
- Keep GA loading with `lazyOnload`; only its initialization order changes.
- Remove the unused `src/app/components/GoogleAnalytics.tsx` (dead `GoogleAnalytics` and `GoogleTagManager` components), so there is a single GA initialization path.
- Update `GOOGLE-ANALYTICS-SETUP.md` to describe the consent behavior.

Out of scope (later steps): English banner copy, English legal pages, rewording the "Al continuar navegando, acepta…" implied-consent sentence, and a "change my cookie choice" link.

## Capabilities

### New Capabilities
- `analytics-consent`: how the site gates Google Analytics storage on the visitor's cookie choice: default state, stored-choice restoration, and runtime accept/reject.

### Modified Capabilities
<!-- None: no existing spec covers analytics or the cookie banner. -->

## Impact

- `src/app/components/SiteDocument.tsx`: GA bootstrap order (shared by both locale layouts and the global 404).
- `src/app/lib/`: new consent bootstrap module beside `theme.ts`.
- `src/app/components/CookieConsent.tsx`: storage key/values reused from the shared module (behavior unchanged).
- `src/app/components/GoogleAnalytics.tsx`: deleted (no importers).
- `GOOGLE-ANALYTICS-SETUP.md`: documentation.
- GA reporting: rejected and not-yet-answered visits stop setting `_ga` cookies; GA4 receives cookieless pings only, so raw visit counts will drop.
- No metadata, structured data, sitemap, robots, or routing changes in either locale.
