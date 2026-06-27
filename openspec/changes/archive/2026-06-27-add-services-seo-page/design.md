## Context

The current site is a single-page marketing experience built with the Next.js App Router under `src/app/`. Shared visual identity comes from global fonts in `src/app/layout.tsx`, dark-first styling, and existing UI components such as the navbar, hamburger menu, and homepage services cards. Service content already exists in `src/data/services.js`, but it is only exposed through the homepage `Services` section and hover-card summaries.

The new work is cross-cutting because it touches routing, navigation, homepage entry points, and SEO behavior. There is also an existing client-side redirect mapping `/services` to `/#servicios`, which must be replaced so the dedicated route can exist without being intercepted.

## Goals / Non-Goals

**Goals:**
- Add a dedicated `/services` page that presents all existing services with richer, crawlable descriptions.
- Keep typography, colors, spacing, and component choices aligned with the current site.
- Make the new page reachable from both desktop and mobile navigation, plus the homepage services section.
- Improve route-level SEO by adding page metadata and structured content where appropriate.

**Non-Goals:**
- Rebrand the site or introduce a new design system.
- Replace the homepage services section with the full page content.
- Add CMS-backed content management or new third-party SEO libraries.
- Rewrite unrelated legacy redirect rules beyond what is needed for `/services`.

## Decisions

### Create a dedicated App Router page at `src/app/services/page.tsx`
This follows the existing Next.js structure and gives the services page its own route, metadata, and server-rendered content.

Alternative considered: keeping all content on `/` and expanding the homepage section. This was rejected because it does not provide a distinct URL target for SEO and makes deep-linking from navigation less clear.

### Reuse the existing services data source, extending it only if richer copy is needed
`src/data/services.js` already enumerates the service catalog, titles, descriptions, and image metadata. Building the new page from this source keeps homepage and dedicated page content synchronized and avoids duplicating service definitions.

Alternative considered: creating a second page-specific data source. This was rejected because it increases maintenance cost and risks inconsistent service copy between the homepage and the new route.

### Update both navigation systems to link to the dedicated page while preserving homepage discoverability
Desktop navbar and mobile hamburger navigation should expose `/services` as a first-class route. The homepage services section should remain on `/` but include a clear call-to-action or linked cards that move users to the new destination.

Alternative considered: leaving navbar behavior unchanged and linking only from the homepage section. This was rejected because the user explicitly wants navbar access and because primary navigation is a stronger internal linking signal.

### Replace the `/services` redirect behavior with route-aware handling
The current `ClientRedirect` maps `/services` to `/#servicios`. Implementation should remove or adjust that mapping so the new route resolves normally, while preserving the remaining legacy redirects.

Alternative considered: keeping the redirect and using another slug such as `/servicios-detallados`. This was rejected because `/services` is already the natural, short path users and search engines would expect.

### Add route-level metadata and structured copy using existing Next.js metadata patterns
The root layout already defines site metadata, so the services route should provide its own `metadata` export and page copy optimized around service discovery. If structured data is added, it should use the same schema.org approach already present in `StructuredData.tsx`.

Alternative considered: relying only on layout-level metadata. This was rejected because route-specific titles, descriptions, and canonical targeting are core to the SEO value of the new page.

## Risks / Trade-offs

- Redirect conflict with the new route -> Remove the `/services` redirect entry or make the redirect logic skip existing pages.
- Shared data may be too short for an SEO-focused page -> Extend the current services dataset with fuller text fields while keeping backward compatibility for the homepage cards.
- More content can make the page visually heavy on mobile -> Organize services into clear sections or stacked cards with existing spacing patterns and responsive layout rules.
- Internal link behavior changes may confuse users accustomed to section scrolling -> Keep the homepage services section visible and add explicit CTA wording so the dedicated page feels like a natural next step.
