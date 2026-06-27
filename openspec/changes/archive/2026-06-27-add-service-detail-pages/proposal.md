## Why

The site now has a dedicated `/services` hub, but each service still shares the same URL, which limits how precisely Google can index individual offerings and how directly users can land on the exact service they need. Dedicated service detail pages are needed now to improve search visibility, strengthen internal linking, and create clear destination pages for each offering.

## What Changes

- Add a dedicated route for each service under `/services/<service-slug>` using the existing service catalog as the source of truth.
- Create individual service pages with the service title, photo, descriptive copy, and a clear call-to-action button.
- Ensure each service uses an SEO-friendly route name derived from its slug and exposes page-level metadata for that specific offering.
- Update the services hub page so users can navigate from the general services page to each individual service page.
- Add route discovery support for search engines through internal links and sitemap coverage for individual service pages.

## Capabilities

### New Capabilities
- `service-detail-pages`: Provide dedicated, crawlable pages for each service with SEO-friendly URLs, service-specific metadata, and clear conversion entry points.

### Modified Capabilities

## Impact

- Affected code will likely include `src/app/services/page.tsx`, a new dynamic route under `src/app/services/`, the shared `src/data/services.js` dataset, and `src/app/sitemap.ts`.
- SEO behavior will expand from a single services landing page to individual indexed service pages with service-level metadata.
- No new external dependencies are expected.
