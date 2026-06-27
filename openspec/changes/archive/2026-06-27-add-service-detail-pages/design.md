## Context

The site already has a dedicated `/services` page backed by the shared `src/data/services.js` catalog. Each service now has a stable `slug`, image, short summary, full description, and highlights, but all offerings still live under the same route. That means the service catalog is content-ready for individual pages, but the routing, metadata, internal linking, and sitemap behavior do not yet expose service-specific destinations.

This work is cross-cutting because it touches the existing services hub, App Router structure, metadata generation, and search discovery. It should remain aligned with the current visual language used on the services hub and the rest of the site.

## Goals / Non-Goals

**Goals:**
- Add a dedicated page for every service under an SEO-friendly route such as `/services/<slug>`.
- Reuse the shared service dataset so each detail page pulls from the existing source of truth.
- Provide page-level metadata and indexable content for each service.
- Add clear navigation from the `/services` hub to each service page and include service detail routes in the sitemap.
- Keep the design language, CTA style, and typography consistent with the current site.

**Non-Goals:**
- Replace the `/services` hub page with only detail pages.
- Introduce a CMS or separate content management workflow.
- Add unrelated service categories or change the business service list.
- Rework the overall navbar or homepage information architecture beyond service-page linking.

## Decisions

### Use a dynamic App Router route under `src/app/services/[slug]/page.tsx`
This keeps the route structure aligned with the current Next.js setup and supports one implementation path for every service page while preserving a consistent URL pattern.

Alternative considered: creating one manual page file per service. This was rejected because the content already lives in a shared catalog and manual files would add duplication and make future edits harder.

### Keep `src/data/services.js` as the source of truth and extend it only if detail-page-specific fields are needed
The current dataset already contains the core fields needed for a useful SEO page. If the detail layout needs more CTA copy or metadata text, that should be added to the same shared records.

Alternative considered: maintaining a second detail-page dataset. This was rejected because it would split content ownership and increase the risk of mismatched service information.

### Generate service-specific metadata from the selected service record
Each detail page should derive title, description, canonical URL, and social metadata from the service being rendered so Google and shared links can represent the specific offering instead of the generic services hub.

Alternative considered: using one static metadata block for all detail pages. This was rejected because it weakens the SEO value of having separate pages.

### Add internal links from the services hub to each detail page
The `/services` hub should become the parent discovery page, and each service card or CTA should lead to the corresponding `/services/<slug>` route. This strengthens internal linking and gives users a natural path from overview to detail.

Alternative considered: relying only on sitemap discovery. This was rejected because in-page internal links are important for both navigation and crawlability.

### Add service detail URLs to the sitemap from the shared service catalog
Because the list of services is already structured in code, the sitemap can enumerate the hub route plus all service-specific routes without new dependencies.

Alternative considered: omitting detail URLs from the sitemap and depending only on internal navigation. This was rejected because sitemap inclusion is a straightforward way to reinforce discovery.

## Risks / Trade-offs

- Duplicate or overly similar content between the hub and detail pages -> Keep the hub page as a concise overview and move fuller narrative plus CTA emphasis to the detail pages.
- Missing service record for an invalid slug -> Use standard not-found handling for unknown slugs.
- Shared data may need more service-specific CTA or metadata copy -> Extend the current service objects with minimal new fields instead of creating parallel content structures.
- More indexed pages increase maintenance expectations -> Centralize service content in one dataset so updates propagate consistently.
