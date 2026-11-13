# Proposal

## Why

The cookie banner offers "Rechazar", but Google Analytics (`G-8NYPRQK16F`) loads and sets its cookies on every visit regardless of the choice. `SiteDocument.tsx` initializes gtag without a consent default, so the banner's `gtag('consent', 'update', …)` calls change nothing for a visitor who rejects, and a returning visitor's stored choice is never re-applied. The site therefore sets analytics cookies for visitors who explicitly declined, which contradicts the banner's own promise and the cookie section of the Términos y Condiciones page it links to. The privacy policy page says nothing about cookies today; fixing that text is a separate copy task.

## What Changes

- Declare a Google Consent Mode v2 default of `denied` for all storage types before any gtag command runs, on every page of both locales.
- Re-apply a returning visitor's stored choice (`localStorage['cookie-consent']`) before GA loads, so an earlier "accept" restores measurement and an earlier "reject" stays denied.
- Keep the banner's accept/reject actions updating consent at runtime; reject leaves analytics denied.
- Keep GA loading with `lazyOnload`; only its initialization order changes.
- Remove the unused `src/app/components/GoogleAnalytics.tsx` (dead `GoogleAnalytics` and `GoogleTagManager` components), so there is a single GA initialization path.
- Clear `_ga`/`_ga_*` cookies left by earlier visits when the stored choice is `rejected`, if Consent Mode does not already do it (tasks 5.4).
- Update `GOOGLE-ANALYTICS-SETUP.md` to describe the consent behavior.

Scope is cookie-level: no analytics cookies for a visitor who declined. Consent Mode still sends cookieless pings to Google, which this change accepts (design D1).

Out of scope (later steps): English banner copy, English legal pages, rewording the "Al continuar navegando, acepta…" implied-consent sentence, and a "change my cookie choice" link. Withdrawal stays impossible until that last item ships.

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
- Legacy `_ga` cookies: visitors who declined while the bug was live already hold them. Consent Mode stops new writes but may not delete existing cookies, so tasks 5.4 verifies a pre-seeded `_ga` and adds cleanup if it survives.
- No metadata, structured data, sitemap, robots, or routing changes in either locale.
