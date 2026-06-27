## 1. Shared Service Content And Routing

- [x] 1.1 Review `src/data/services.js` and add any minimal extra fields needed to support service-specific metadata or CTA copy without duplicating content definitions.
- [x] 1.2 Create a dynamic route at `src/app/services/[slug]/page.tsx` that resolves service pages from the shared service catalog and returns not-found behavior for invalid slugs.
- [x] 1.3 Add service-specific metadata generation for each `/services/<slug>` page using the selected service record.

## 2. Hub To Detail Navigation

- [x] 2.1 Update the `/services` hub page so each service links to its dedicated detail route.
- [x] 2.2 Ensure each detail page includes the service title, photo, descriptive content, and a clear call-to-action button aligned with the current site UI.
- [x] 2.3 Add contextual navigation such as breadcrumbs or back-links so users can move between the services hub and detail pages naturally.

## 3. Search Discovery And Verification

- [x] 3.1 Update the sitemap to include every valid `/services/<slug>` route from the shared service catalog.
- [x] 3.2 Add any page-level structured data needed so individual service pages are more understandable to search engines.
- [x] 3.3 Verify all service routes build correctly, confirm hub-to-detail navigation works, and run the project build or other relevant checks.
