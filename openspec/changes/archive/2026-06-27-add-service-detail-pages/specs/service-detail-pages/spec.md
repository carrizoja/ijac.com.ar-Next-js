## ADDED Requirements

### Requirement: Each service has a dedicated detail page
The application SHALL expose a dedicated route for each service under `/services/<service-slug>` using the service catalog as the source of truth.

#### Scenario: User opens a service detail page
- **WHEN** a user navigates to a valid service slug route
- **THEN** the application renders a standalone page for that service

#### Scenario: Invalid service slug is requested
- **WHEN** a user navigates to a slug that does not match any service in the catalog
- **THEN** the application MUST return the standard not-found behavior

### Requirement: Service detail pages expose crawlable service content
Each service detail page SHALL present the service title, image, and descriptive content as visible page content rather than requiring hover or interaction to reveal the core information.

#### Scenario: Search engine or user loads a service page
- **WHEN** the service detail page is rendered
- **THEN** the service title, photo, and descriptive copy are present in the document content

#### Scenario: Service page includes a conversion path
- **WHEN** a user reads a service detail page
- **THEN** the page includes a clear call-to-action button leading toward contact or consultation

### Requirement: Service routes are SEO-friendly and service-specific
The application SHALL use the service slug as the public route segment and generate page metadata specific to the selected service.

#### Scenario: Metadata is generated for a service page
- **WHEN** the application builds metadata for `/services/<service-slug>`
- **THEN** the title, description, and canonical URL correspond to that service

#### Scenario: Service URL matches its slug
- **WHEN** a service is published in the catalog
- **THEN** the public route for that page uses the existing service slug under `/services/`

### Requirement: Services hub links to individual service pages
The `/services` hub SHALL provide internal links from the overview experience to each corresponding service detail page.

#### Scenario: User explores a service from the hub page
- **WHEN** a user selects a service from the `/services` page
- **THEN** the application navigates to that service's detail route

### Requirement: Service detail pages are discoverable through the sitemap
The application SHALL include each service detail route in the sitemap output.

#### Scenario: Sitemap is generated
- **WHEN** the sitemap route is built
- **THEN** it includes `/services` and every valid `/services/<service-slug>` page
