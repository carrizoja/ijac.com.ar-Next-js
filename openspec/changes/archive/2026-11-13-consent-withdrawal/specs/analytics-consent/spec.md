# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

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
