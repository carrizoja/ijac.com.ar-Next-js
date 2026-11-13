# Proposal

## Why

The cookie banner (`src/app/components/CookieConsent.tsx`) hardcodes its heading, body text and both buttons in Spanish. Visitors on `/en/…` read the rest of the page in English and get a Spanish consent prompt, which is the second open gap listed in `GOOGLE-ANALYTICS-SETUP.md` → Known gaps.

## What Changes

- Move the banner copy into a typed bilingual module, `src/i18n/chrome/cookie-consent.ts`, following `footer.ts`.
- Pick the copy from the URL with `usePathname()` + `getLocaleFromPath()`, like the footer does.
- Spanish copy stays byte-identical. English adds a faithful translation of the same text, with `Accept Cookies` / `Reject` buttons.
- The links keep pointing at `/terminos-y-condiciones` and `/politica-de-privacidad` in both locales; the legal pages have no English counterpart, so no `/en` route is added.
- Consent behavior (storage, `gtag` updates, cookie expiry, withdrawal, legal-page suppression) does not change.

Out of scope: rewording the "Al continuar navegando, acepta…" implied-consent sentence (the English text translates it as-is), English legal pages, and the privacy policy cookie section.

## Capabilities

### Modified Capabilities
- `analytics-consent`: the banner copy follows the page locale; the "Locale surfaces are unaffected" requirement no longer forbids that banner copy change.

## Impact

- `src/app/components/CookieConsent.tsx`: copy read from the new module; markup and handlers unchanged.
- `src/i18n/chrome/cookie-consent.ts`: new.
- `GOOGLE-ANALYTICS-SETUP.md`: Known gaps updated.
- No metadata, hreflang, structured data, sitemap, robots or routing changes.

## Rollback

Revert the commit; the banner returns to Spanish-only. No stored data or consent state changes shape.
