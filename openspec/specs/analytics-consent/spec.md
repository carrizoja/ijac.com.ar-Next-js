# analytics-consent Specification

## Purpose
Defines how the site gates Google Analytics storage on the visitor's cookie choice, so analytics cookies are set only for visitors who accepted them.

## Requirements

### Requirement: Analytics storage is denied by default
Every page in every locale (Spanish `/…`, English `/en/…`, and the 404 page) MUST declare Google consent defaults of `denied` for `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization` before any other gtag command is queued. The declaration MUST be in the static HTML, so it does not depend on client-side hydration.

#### Scenario: First visit with no stored choice
- **GIVEN** a visitor with no `cookie-consent` value in local storage
- **WHEN** any page loads and Google Analytics finishes loading
- **THEN** the first consent command in `dataLayer` is a `default` with all four storage types `denied`
- **AND** no `_ga` or `_ga_*` cookie is present

#### Scenario: Default is present in both locales
- **WHEN** the exported HTML of `/`, `/en/`, and the 404 page is inspected
- **THEN** each has a real inline `<script>` in the `<head>` whose text declares the consent default

### Requirement: A stored choice is restored before analytics loads
When local storage holds `cookie-consent` = `accepted`, the page MUST grant `analytics_storage` before Google Analytics sends its first hit. Any other stored value, or none, MUST leave analytics denied. A stored `rejected` choice MUST leave no `_ga` or `_ga_*` cookie present, including cookies left by an earlier visit. If local storage cannot be read, analytics MUST stay denied and the page MUST keep working.

#### Scenario: Returning visitor who accepted
- **GIVEN** `cookie-consent` = `accepted` in local storage
- **WHEN** a page loads
- **THEN** `analytics_storage` is granted before the GA `config` command
- **AND** the banner is not shown

#### Scenario: Returning visitor who rejected
- **GIVEN** `cookie-consent` = `rejected` in local storage
- **WHEN** a page loads
- **THEN** `analytics_storage` stays `denied` and no `_ga` cookie is present
- **AND** the banner is not shown

#### Scenario: Legacy cookies from a visit before the fix
- **GIVEN** `cookie-consent` = `rejected` in local storage
- **AND** `_ga` or `_ga_*` cookies left behind by an earlier visit
- **WHEN** a page loads
- **THEN** `analytics_storage` stays `denied`
- **AND** no `_ga` or `_ga_*` cookie is present afterwards

#### Scenario: Storage unavailable
- **GIVEN** local storage access throws (for example, blocked site data)
- **WHEN** a page loads
- **THEN** analytics stays denied, no script error stops the page, the theme bootstrap still runs, and the consent banner does not throw

### Requirement: Banner choices update consent immediately
Choosing "Aceptar Cookies" MUST store `accepted` and grant `analytics_storage` without a reload. Choosing "Rechazar" MUST store `rejected` and keep `analytics_storage` denied. Both MUST work even when Google Analytics has not finished loading yet.

#### Scenario: Accept before GA has loaded
- **GIVEN** a first-time visitor whose GA script has not loaded yet
- **WHEN** they click "Aceptar Cookies"
- **THEN** a consent `update` granting `analytics_storage` is queued in `dataLayer`
- **AND** it takes effect once GA loads, without a reload

#### Scenario: Reject
- **WHEN** a visitor clicks "Rechazar"
- **THEN** `cookie-consent` = `rejected` is stored, `analytics_storage` remains denied, and no `_ga` cookie is present

### Requirement: Locale surfaces are unaffected
This change MUST NOT alter metadata, hreflang alternates, structured data, `sitemap.xml`, `robots.txt`, or routing in either locale, and MUST NOT change the visible banner copy.

#### Scenario: Build output parity
- **WHEN** the site is built before and after the change
- **THEN** `sitemap.xml`, `robots.txt`, and each page's JSON-LD and `<meta>`/`<link rel="alternate">` tags are identical
