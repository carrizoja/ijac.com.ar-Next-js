# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Locale surfaces are unaffected
This change MUST NOT alter metadata, hreflang alternates, structured data, `sitemap.xml`, `robots.txt`, or routing in either locale. The only visible banner copy change allowed is the English variant on `/en` pages; the Spanish banner copy MUST NOT change.

#### Scenario: Build output parity
- **WHEN** the site is built before and after the change
- **THEN** `sitemap.xml`, `robots.txt`, and each page's JSON-LD and `<meta>`/`<link rel="alternate">` tags are identical
