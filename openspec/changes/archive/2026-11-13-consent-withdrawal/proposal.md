# Proposal

## Why

The site now gates Google Analytics on the cookie banner's choice, but the banner hides as soon as a choice is stored and never comes back. A visitor who accepted once has no way to change that decision short of wiping their browser data by hand — so the consent the site asks for cannot be withdrawn, which is both a poor experience and a weak consent model. The accepted path is the only path with no exit.

## What Changes

- Add a footer control, `Configurar cookies` (Spanish) / `Cookie settings` (English), on every page in both locales.
- Activating it withdraws consent immediately: analytics storage is denied, any `_ga`/`_ga_*` cookies are removed, and the stored choice is cleared.
- Clearing the stored choice makes the existing banner reappear so the visitor can choose again — accepting later is possible from the same control.
- Withdrawal also works on the legal pages, where the banner is normally suppressed, so the control never appears to do nothing.
- Rejecting (whether from the reopened banner or a first visit) also removes any `_ga`/`_ga_*` cookies left by an earlier acceptance, not just stops new ones.
- No new route, no metadata, sitemap, robots, hreflang or routing change; banner copy is untouched.

## Capabilities

### New Capabilities

None. Withdrawal completes the existing consent behavior rather than introducing a new system behavior.

### Modified Capabilities

- `analytics-consent`: adds a visitor-initiated withdrawal path (footer control, immediate denial, cookie removal, stored-choice removal, banner reappearance) and makes rejection remove pre-existing analytics cookies.

## Impact

- `src/i18n/chrome/footer.ts`: bilingual copy for the new control.
- `src/app/components/Footer.tsx`: renders the control.
- `src/app/components/CookieConsent.tsx`: listens for withdrawal, denies, expires cookies, clears storage, reopens the banner.
- `src/app/lib/consent.ts`: withdrawal event name, the `window.gtag` typing already needed, and a named cookie-cleanup entry point exported from the existing head bootstrap so the withdraw path reuses it instead of duplicating the expiry logic.
- Tests for the footer control, the banner's withdrawal path, the bootstrap's cleanup entry point, and build-output checks for both locales.
- `GOOGLE-ANALYTICS-SETUP.md`: document the withdrawal flow and how to verify it.
- No dependency changes. Static export only; no server runtime, no new route.
- Rollback: revert the commit. Withdrawal only removes cookies and a local-storage key, so reverting leaves visitors in the pre-change state (banner accepted/rejected, no way to change it) with no data migration needed.
