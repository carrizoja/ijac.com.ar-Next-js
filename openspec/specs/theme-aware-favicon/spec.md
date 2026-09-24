## Purpose

Provide a legible iJAC browser favicon across light and dark browser chrome while preserving a reliable fallback for clients with limited favicon media-query support.

## ADDED Requirements

### Requirement: Color-scheme-aware browser favicon
The site SHALL advertise the current favicon for light color schemes and the negative-logo favicon for dark color schemes by using standards-based `prefers-color-scheme` conditions.

#### Scenario: Browser prefers a light color scheme
- **GIVEN** a browser supports media conditions on favicon links
- **WHEN** the browser or operating system reports `prefers-color-scheme: light`
- **THEN** the browser can select the current favicon

#### Scenario: Browser prefers a dark color scheme
- **GIVEN** a browser supports media conditions on favicon links
- **WHEN** the browser or operating system reports `prefers-color-scheme: dark`
- **THEN** the browser can select the negative-logo favicon

### Requirement: Compatibility fallback
The site MUST advertise the current favicon without a media condition in addition to the color-scheme-specific declarations.

#### Scenario: Media-specific favicon selection is unsupported
- **GIVEN** a browser ignores or does not support media conditions on favicon links
- **WHEN** the browser loads any page on the site
- **THEN** the current favicon remains available as the fallback

#### Scenario: Color-scheme preference is unavailable
- **GIVEN** the browser does not report a usable light or dark color-scheme preference
- **WHEN** the browser loads any page on the site
- **THEN** the current favicon remains available as the fallback

### Requirement: Locale-consistent favicon metadata
The Spanish and English document roots SHALL expose equivalent browser favicon declarations.

#### Scenario: Spanish page metadata is generated
- **GIVEN** a Spanish route under the unprefixed site is requested
- **WHEN** its document metadata is generated
- **THEN** the document exposes the fallback, light-scheme, and dark-scheme favicon declarations

#### Scenario: English page metadata is generated
- **GIVEN** an English route under `/en` is requested
- **WHEN** its document metadata is generated
- **THEN** the document exposes the same fallback, light-scheme, and dark-scheme favicon declarations as the Spanish document

### Requirement: Existing non-browser-icon behavior remains unchanged
The change MUST NOT alter installed-app manifest icons, Apple touch icons, structured data, sitemap entries, or route availability for either locale.

#### Scenario: Non-browser icon metadata is generated
- **GIVEN** the theme-aware browser favicon declarations are present
- **WHEN** the manifest, Apple touch metadata, structured data, sitemap, and locale routes are generated
- **THEN** their existing values and availability remain unchanged
