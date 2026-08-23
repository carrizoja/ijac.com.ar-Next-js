## Purpose

Provide every visitor who reaches an unavailable application URL with a consistent, accessible explanation and a reliable path back to valid site content.

## ADDED Requirements

### Requirement: Invalid routes show the not-found experience
The system SHALL render the custom not-found experience for every URL that does not match an application route and for route content explicitly reported as unavailable.

#### Scenario: Unmatched URL
- **WHEN** a visitor requests a URL that does not match any application route
- **THEN** the system displays the custom not-found experience with an HTTP 404 response

#### Scenario: Missing dynamic content
- **WHEN** a matched dynamic route reports that its requested content does not exist
- **THEN** the system displays the same custom not-found experience

### Requirement: Visitors can recover from a not-found page
The system SHALL explain in Spanish that the requested page is unavailable and SHALL provide a clearly identified link to the site home page.

#### Scenario: Return to home
- **WHEN** a visitor activates the home recovery link
- **THEN** the system navigates the visitor to `/`

### Requirement: The not-found experience is responsive and accessible
The system SHALL present the primary message and recovery action without horizontal overflow on supported mobile and desktop viewports, SHALL use semantic heading and main-content structure, and SHALL expose decorative content as non-essential to assistive technology.

#### Scenario: Keyboard and assistive technology use
- **WHEN** a visitor navigates the not-found page with a keyboard or screen reader
- **THEN** the page exposes a descriptive heading and a focus-visible home link with an unambiguous accessible name

#### Scenario: Reduced motion preference
- **WHEN** a visitor has enabled reduced motion in their operating system
- **THEN** the not-found experience does not require non-essential motion to understand or use its content
