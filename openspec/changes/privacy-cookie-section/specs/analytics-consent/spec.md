# Spec Delta

## ADDED Requirements

### Requirement: The privacy policy describes the consent behavior
The Spanish privacy policy MUST contain a cookie and consent section that matches the shipped consent behavior, and MUST NOT claim that no data leaves the browser when the visitor declines. The page's metadata MUST NOT change.

#### Scenario: Visitor reads the policy
- **WHEN** a visitor opens `/politica-de-privacidad`
- **THEN** the section "4. Cookies y Consentimiento" states that the site uses Google Analytics 4 `G-8NYPRQK16F` with Consent Mode v2 advanced
- **AND** that `analytics_storage`, `ad_storage`, `ad_user_data` and `ad_personalization` are denied by default, and accepting grants only `analytics_storage`
- **AND** that `_ga` / `_ga_*` cookies are written only after acceptance and removed on rejection or withdrawal
- **AND** that the choice can be changed with the banner and the footer control, and is stored as `cookie-consent` and `cookie-consent-date` in local storage
- **AND** the later sections are numbered 5 to 8

#### Scenario: Declining is described honestly
- **WHEN** the section describes a rejection
- **THEN** it states that Google Analytics still receives cookieless pings

#### Scenario: Metadata parity
- **WHEN** the site is built before and after the change
- **THEN** the page's `<title>`, `<meta>` and `<link rel="alternate">` tags, `sitemap.xml` and `robots.txt` are identical
