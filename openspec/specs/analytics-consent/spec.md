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
Choosing "Aceptar Cookies" MUST store `accepted` and grant `analytics_storage` without a reload. Choosing "Rechazar" MUST store `rejected`, keep `analytics_storage` denied, and remove any `_ga` or `_ga_*` cookie, including one written while consent was granted. Both MUST work even when Google Analytics has not finished loading yet.

#### Scenario: Accept before GA has loaded
- **GIVEN** a first-time visitor whose GA script has not loaded yet
- **WHEN** they click "Aceptar Cookies"
- **THEN** a consent `update` granting `analytics_storage` is queued in `dataLayer`
- **AND** it takes effect once GA loads, without a reload

#### Scenario: Reject
- **WHEN** a visitor clicks "Rechazar"
- **THEN** `cookie-consent` = `rejected` is stored, `analytics_storage` remains denied, and no `_ga` cookie is present

#### Scenario: Reject after an acceptance in the same session
- **GIVEN** a visitor who accepted, so `_ga` and `_ga_*` cookies exist
- **WHEN** they reopen the banner and click "Rechazar"
- **THEN** `cookie-consent` = `rejected` is stored and no `_ga` or `_ga_*` cookie remains

### Requirement: Locale surfaces are unaffected
This change MUST NOT alter metadata, hreflang alternates, structured data, `sitemap.xml`, `robots.txt`, or routing in either locale. The only visible banner copy change allowed is the English variant on `/en` pages; the Spanish banner copy MUST NOT change.

#### Scenario: Build output parity
- **WHEN** the site is built before and after the change
- **THEN** `sitemap.xml`, `robots.txt`, and each page's JSON-LD and `<meta>`/`<link rel="alternate">` tags are identical

### Requirement: Every page offers a consent withdrawal control
Every page in both locales MUST expose a control labelled in the visitor's language — "Configurar cookies" in Spanish and "Cookie settings" in English — that withdraws the stored consent. The control MUST be operable by keyboard and MUST NOT navigate away from the current page.

#### Scenario: Both locales expose the control
- **WHEN** a visitor loads any Spanish page, or any English page under `/en/…`
- **THEN** the footer contains the withdrawal control with that locale's label
- **AND** activating it does not change the URL

#### Scenario: Keyboard only
- **GIVEN** a visitor who navigates with the keyboard
- **WHEN** they tab to the footer and activate the control
- **THEN** consent is withdrawn exactly as it is for a pointer click

### Requirement: Withdrawal denies analytics storage and removes analytics cookies
Withdrawing consent MUST deny `analytics_storage` without a reload, including when Google Analytics has not finished loading, and MUST leave no `_ga` or `_ga_*` cookie present — cookies written while consent was granted included.

#### Scenario: Accepted visitor withdraws
- **GIVEN** `cookie-consent` = `accepted` and `_ga`/`_ga_*` cookies from earlier page views
- **WHEN** the visitor activates the withdrawal control
- **THEN** `analytics_storage` is denied
- **AND** no `_ga` or `_ga_*` cookie is present afterwards

#### Scenario: GA has not loaded yet
- **GIVEN** a visitor whose Google Analytics script has not loaded
- **WHEN** they withdraw consent
- **THEN** the denial is queued so it applies once Google Analytics loads, without a reload

### Requirement: Withdrawal clears the stored choice and restores the banner
Withdrawal MUST remove the stored choice, so the site no longer treats the visitor as having answered, and MUST show the banner again in the same session without a reload. After a reload the visitor MUST start from no recorded choice, with analytics denied and the banner shown.

#### Scenario: Banner reappears in the same session
- **GIVEN** a visitor whose stored choice is `accepted`
- **WHEN** they withdraw consent
- **THEN** `cookie-consent` and its stored date are removed
- **AND** the banner is visible again so they can choose

#### Scenario: Reload after withdrawal
- **GIVEN** a visitor who withdrew consent and then reloaded the page
- **THEN** no `cookie-consent` value is stored, analytics stays denied, no `_ga` cookie is present, and the banner is shown

#### Scenario: Choosing again after withdrawal
- **GIVEN** a visitor who withdrew consent and sees the restored banner
- **WHEN** they choose "Aceptar Cookies"
- **THEN** `cookie-consent` = `accepted` is stored again and analytics is granted

### Requirement: Withdrawal works where the banner is suppressed
On the legal pages, where the banner is not shown on a first visit, an explicit withdrawal MUST still show the restored banner. The visitor MUST never activate the control and see no response.

#### Scenario: Withdrawal from a legal page
- **GIVEN** a visitor on `/terminos-y-condiciones` or `/politica-de-privacidad`
- **WHEN** they activate the withdrawal control
- **THEN** consent is withdrawn and the banner is shown on that page

### Requirement: Withdrawal still denies analytics when storage is unavailable
When local storage cannot be written or read, withdrawal MUST still deny `analytics_storage`, remove any `_ga` or `_ga_*` cookie, show the banner, and leave the page working without a script error.

#### Scenario: Blocked site data
- **GIVEN** a browser where local-storage access throws
- **WHEN** the visitor activates the withdrawal control
- **THEN** analytics stays denied, no `_ga` cookie is present, the banner is shown, and nothing throws

### Requirement: The banner speaks the page locale
The cookie banner MUST render its heading, body text, link labels and button labels in the locale of the current URL: Spanish on unprefixed paths and English under `/en`. The Spanish copy MUST stay exactly as it was before English was added. In both locales the links MUST point at `/terminos-y-condiciones` and `/politica-de-privacidad`, and both buttons MUST store and apply the choice exactly as the Spanish buttons do.

#### Scenario: English page
- **GIVEN** a visitor with no stored choice on `/en/`
- **WHEN** the banner appears
- **THEN** it shows the heading "🍪 Use of Cookies" and the buttons "Accept Cookies" and "Reject"
- **AND** its links point at `/terminos-y-condiciones` and `/politica-de-privacidad`

#### Scenario: Spanish page
- **GIVEN** a visitor with no stored choice on `/`
- **WHEN** the banner appears
- **THEN** it shows "🍪 Uso de Cookies", the unchanged Spanish body text, and the buttons "Aceptar Cookies" and "Rechazar"

#### Scenario: English choice
- **WHEN** a visitor on `/en/` clicks "Accept Cookies"
- **THEN** `cookie-consent` = `accepted` is stored and `analytics_storage` is granted
- **AND WHEN** a visitor on `/en/` clicks "Reject"
- **THEN** `cookie-consent` = `rejected` is stored and `analytics_storage` stays denied
