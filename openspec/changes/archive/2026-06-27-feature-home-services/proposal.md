## Why

The homepage `Servicios` section currently shows the full service catalog, which dilutes emphasis on the most strategic offerings and overlaps heavily with the dedicated `/services` page. Curating a smaller featured set on the homepage will make the landing experience clearer while pushing users toward the full services page for broader exploration.

## What Changes

- Update the Home `Servicios` section to show only these featured services: `Ciberseguridad y Protección de Datos para Empresas`, `Desarrollo de Sitios Web y Aplicaciones Móviles`, `Soporte Técnico para PC, Mac y Apple en CABA`, and `Instalación de Redes WiFi y Cableado Estructurado`.
- Keep the remaining services available on the `/services` page instead of the homepage feature grid.
- Add or preserve a clear call-to-action button from the homepage `Servicios` section to the `/services` page.
- Reuse the existing service catalog as the source of truth so homepage curation does not duplicate service definitions.

## Capabilities

### New Capabilities
- `home-featured-services`: Provide a curated featured-services experience on the homepage that highlights a specific subset of offerings and funnels users to the full `/services` catalog.

### Modified Capabilities

## Impact

- Affected code will likely include `src/app/components/Services.tsx`, the shared `src/data/services.js` catalog, and possibly the card rendering inputs used by the homepage.
- The `/services` route remains the full catalog destination; no new dependencies are expected.
