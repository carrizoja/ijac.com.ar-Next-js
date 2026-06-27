## ADDED Requirements

### Requirement: Dedicated services route
The application SHALL expose a dedicated `/services` route that renders a full services page for iJac IT Solutions instead of redirecting users back to the homepage services section.

#### Scenario: User visits the services page directly
- **WHEN** a user navigates to `/services`
- **THEN** the application renders a standalone services page

#### Scenario: Legacy redirect logic does not override the route
- **WHEN** the application processes client-side redirect rules for the `/services` pathname
- **THEN** it MUST allow the dedicated services page to load instead of redirecting to `/#servicios`

### Requirement: Full service descriptions are crawlable
The services page SHALL present every currently offered service with visible, text-based descriptions that search engines and users can read without hover-only interaction.

#### Scenario: Service content is rendered on the page
- **WHEN** the services page loads
- **THEN** each service offering appears with its title and descriptive copy in the rendered document

#### Scenario: Existing service catalog remains represented
- **WHEN** the business reviews the services page content
- **THEN** the page includes all services currently listed in the shared services catalog

### Requirement: Services page uses existing site visual language
The services page SHALL use the same typography, color palette, and UI styling conventions as the rest of the website.

#### Scenario: User navigates from the homepage to the services page
- **WHEN** the user opens the dedicated services route from another site page
- **THEN** the destination visually aligns with the existing global fonts, dark theme styling, and shared component patterns

### Requirement: Primary navigation links to the services page
The application SHALL provide access to the dedicated services page from the site navigation and from the homepage services section.

#### Scenario: Desktop or mobile user looks for services in navigation
- **WHEN** a user opens the main navigation on desktop or mobile
- **THEN** the navigation includes a link to `/services`

#### Scenario: Homepage services section leads to the dedicated page
- **WHEN** a user interacts with the homepage services section entry point
- **THEN** the user can navigate from that section to the full services page

### Requirement: Services route exposes page-specific SEO metadata
The `/services` route SHALL define metadata tailored to service discovery for the business.

#### Scenario: Search engines inspect the services route
- **WHEN** the `/services` page metadata is generated
- **THEN** the page provides a route-specific title and description aligned with the services content

#### Scenario: Services route has a canonical destination
- **WHEN** the `/services` page is shared or indexed
- **THEN** the route resolves as a first-class page under the site domain rather than as a homepage anchor
