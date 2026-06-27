## Context

The homepage `Servicios` section currently renders the full shared services catalog through `src/app/components/Services.tsx`, while the dedicated `/services` page already serves as the broader catalog destination. The user wants the homepage to act more like a curated landing section that highlights selected offerings and pushes deeper exploration to `/services`.

The selected featured services are:
- `Ciberseguridad y Protección de Datos para Empresas`
- `Desarrollo de Sitios Web y Aplicaciones Móviles`
- `Soporte Técnico para PC, Mac y Apple en CABA`
- `Instalación de Redes WiFi y Cableado Estructurado`

## Goals / Non-Goals

**Goals:**
- Limit the homepage `Servicios` section to the chosen featured services only.
- Keep the `/services` page as the place where users can browse the full service catalog.
- Preserve the existing visual language and CTA pattern already used in the homepage section.
- Reuse the shared service catalog as the source of truth rather than duplicating service data.

**Non-Goals:**
- Remove or reduce services from the `/services` page.
- Redesign the full services card component system from scratch.
- Change individual service detail pages or service metadata.
- Add CMS behavior or admin-configurable featured ordering.

## Decisions

### Derive homepage featured services from the shared catalog by slug
The homepage should select the featured subset by matching the existing service slugs in `src/data/services.js`. This keeps one source of truth for titles, images, and descriptions.

Alternative considered: creating a second hard-coded array of full service objects in the homepage component. This was rejected because it would duplicate content and become harder to keep synchronized.

### Keep `/services` as the complete catalog destination
Only the homepage section becomes curated. The full `/services` route remains unchanged in scope so users can still access every service from the CTA and deeper exploration path.

Alternative considered: removing non-featured services from the broader catalog view too. This was rejected because the user explicitly wants the remaining services to stay on `/services`.

### Preserve the existing CTA to `/services`
The homepage already includes a CTA button pointing to `/services`. Implementation should keep or minimally refine that CTA rather than introducing a more complex interaction pattern.

Alternative considered: linking users directly from the homepage only to individual service pages. This was rejected because the user explicitly wants the remaining services available through the `/services` page and asked for a CTA to that page.

## Risks / Trade-offs

- Featured services could drift from business priorities over time -> Keep selection logic centralized and easy to edit by slug.
- A filtered homepage list may reduce visibility of secondary services on `/` -> Preserve a clear CTA to `/services` so users still have an obvious path to the full catalog.
- If the homepage card component relies on full-catalog assumptions, filtering may expose layout edge cases -> Reuse the existing component with the same card shape and only change the input list.
