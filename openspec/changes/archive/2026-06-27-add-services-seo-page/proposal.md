## Why

The site currently exposes services only as a homepage section, which limits how much indexable content search engines can associate with each offering and gives users no dedicated destination to explore service details. A standalone services page is needed now to improve SEO coverage while keeping the browsing experience aligned with the current brand and navigation patterns.

## What Changes

- Add a dedicated `/services` page with richer descriptions for every service currently offered by iJac IT Solutions.
- Reuse the existing visual language, typography, colors, and component patterns so the new page feels native to the current site.
- Update primary navigation so users can reach the new services page from the navbar and from the homepage services section.
- Add page-level SEO content and metadata tailored to service discovery.
- Preserve the homepage services section as a discovery entry point while making it lead into the full services page.

## Capabilities

### New Capabilities
- `services-page`: Provide a dedicated, SEO-focused services destination with full service descriptions, internal navigation entry points, and metadata consistent with the existing website.

### Modified Capabilities

## Impact

- Affected code will likely include `src/app/page.tsx`, the navbar and mobile navigation components, the homepage services section, service content data, and a new route under `src/app/services/`.
- SEO-related metadata and structured content may need updates for the new route.
- No new external dependencies are expected.
