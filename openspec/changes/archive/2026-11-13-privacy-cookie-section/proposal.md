# Proposal

## Why

The privacy policy (`/politica-de-privacidad`) mentions Google Analytics but says nothing about cookies or consent. The banner links to it, so a visitor deciding whether to accept finds no description of what accepting or rejecting does. This is the last open item in `GOOGLE-ANALYTICS-SETUP.md` → Known gaps.

## What Changes

- Add section "4. Cookies y Consentimiento" to `src/app/(es)/politica-de-privacidad/page.tsx`, in Spanish, describing the shipped behavior: GA4 `G-8NYPRQK16F` with Consent Mode v2 advanced; all storage denied by default; accepting grants only `analytics_storage`; `_ga` / `_ga_*` written only after acceptance and removed on rejection or withdrawal; declining still sends cookieless pings; changing the choice via the banner and the footer control; the choice stored as `cookie-consent` / `cookie-consent-date` in local storage.
- Renumber the following sections (5–8).
- Storage keys and footer labels are read from `src/app/lib/consent.ts` and `src/i18n/chrome/footer.ts`, so the text cannot drift from the code.

The wording is a factual description, not legal advice; the site owner reviews the final text.

Out of scope: an English privacy policy, rewording the existing sections, metadata, hreflang, sitemap and robots.

## Capabilities

### Modified Capabilities
- `analytics-consent`: the privacy policy describes the consent behavior.

## Impact

- `src/app/(es)/politica-de-privacidad/page.tsx`: new section, renumbered headings.
- `GOOGLE-ANALYTICS-SETUP.md`: Known gaps updated.
- No metadata, routing, sitemap or robots changes; no behavior change.

## Rollback

Revert the commit. No stored data or consent state is affected.
