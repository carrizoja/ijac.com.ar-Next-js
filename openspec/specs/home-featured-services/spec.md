## ADDED Requirements

### Requirement: Homepage services section shows only the featured subset
The homepage `Servicios` section SHALL render only the selected featured services instead of the full service catalog.

#### Scenario: User views the homepage services section
- **WHEN** the homepage `Servicios` section is rendered
- **THEN** it shows only `Ciberseguridad y Protección de Datos para Empresas`, `Desarrollo de Sitios Web y Aplicaciones Móviles`, `Soporte Técnico para PC, Mac y Apple en CABA`, and `Instalación de Redes WiFi y Cableado Estructurado`

#### Scenario: Non-featured services are omitted from homepage feature grid
- **WHEN** the homepage services cards are displayed
- **THEN** services outside the featured subset do not appear in that homepage grid

### Requirement: Full services catalog remains available on `/services`
The application SHALL keep the remaining services accessible from the dedicated `/services` page.

#### Scenario: User wants to browse more than the featured services
- **WHEN** a user navigates to `/services`
- **THEN** the page still includes the broader service catalog beyond the homepage featured subset

### Requirement: Homepage services section includes a route to the full catalog
The homepage `Servicios` section SHALL provide a clear call-to-action leading to `/services`.

#### Scenario: User wants to see all services from the homepage
- **WHEN** the user interacts with the services section CTA
- **THEN** the application navigates to `/services`
