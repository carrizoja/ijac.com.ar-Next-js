## Context

See `proposal.md` for motivation and `specs/theme-aware-favicon/spec.md` for the behavior contract.

The site has two root layouts, but both render the shared `SiteDocument`, whose `<head>` is therefore the narrowest common integration point. Browser icons currently come from Next.js file-based metadata (`src/app/icon.png` and `src/app/apple-icon.png`) plus existing static favicon files under `public/`. The static export must remain deployable to Hostinger without runtime selection.

Next.js supports `media` on metadata icon descriptors, but defining `metadata.icons` causes file-based icon metadata to be skipped. That would also require taking ownership of the existing Apple touch icon declaration. This change does not need to alter Apple touch or installed-app icon behavior.

## Goals / Non-Goals

**Goals:**
- Keep selection entirely declarative and browser-controlled through `prefers-color-scheme`.
- Define the favicon links once for both locale roots.
- Preserve an unconditional current-favicon fallback and all non-browser icon metadata.
- Keep implementation and verification comfortably within one review slice under the 400 changed-line budget.

**Non-Goals:**
- Synchronizing the favicon with the site's in-page theme toggle; browser/OS preference is authoritative.
- Changing manifest icons, Apple touch icons, theme colors, routing, structured data, or sitemap output.
- Adding client-side favicon swapping, event listeners, dependencies, or server behavior.

## Decisions

### Add explicit standard link elements in the shared document head

Add three `rel="icon"` declarations to the shared `SiteDocument` head in this order:

1. The current favicon with no `media` attribute as the compatibility fallback.
2. The current favicon with `media="(prefers-color-scheme: light)"`.
3. The negative-logo favicon with `media="(prefers-color-scheme: dark)"`.

All links will declare an accurate MIME type, and scheme-specific assets will use equivalent dimensions so media selection is the differentiator. Because both locale root layouts render `SiteDocument`, the declarations apply consistently to `/` and `/en` without duplicated metadata.

**Alternative considered:** Configure `Metadata.icons` in both root metadata exports. Rejected because dynamic icon metadata suppresses file-based icon and Apple icon discovery in Next.js; preserving current Apple behavior would expand this narrowly scoped change and create duplicate locale configuration.

**Alternative considered:** Swap the icon with client-side JavaScript. Rejected because link-level media queries are standards-based, work before hydration, and do not require runtime state or listeners.

### Retain the existing favicon as the fallback asset

The unconditional and light-scheme links will point to the existing favicon rather than a recreated copy. Implementation will add one dark favicon derived from the approved negative iJAC logo, using a stable public URL suitable for static export.

**Alternative considered:** Make both declarations conditional with no unconditional icon. Rejected because clients that ignore favicon media attributes could then select unpredictably or expose no intended fallback.

### Verify emitted static HTML rather than browser-brand behavior

Automated checks will assert the exact fallback, light, and dark link contract in both locale outputs and confirm that the dark asset is emitted. A manual Chrome check may confirm visual selection in light and dark OS modes, but automated acceptance will not depend on Chrome-specific internals or cache timing.

## Risks / Trade-offs

- **[Browser favicon caches can mask a correct update]** → Validate generated HTML and asset URLs first; use a clean profile or cleared favicon cache for manual checks.
- **[Some clients ignore `media` on favicon links]** → Keep the current favicon as the unconditional first declaration.
- **[Multiple icon candidates can vary across legacy browsers]** → Keep all unconditional candidates on the current artwork and place the two explicit scheme declarations in deterministic fallback/light/dark order.
- **[The negative logo may lose detail at favicon sizes]** → Generate the dark asset from the approved source and inspect it at its declared pixel size before acceptance.
- **[Raw `<link>` elements are less integrated with Next.js metadata typing]** → Limit them to the shared document head and cover the emitted static HTML; this avoids replacing unrelated file-based Apple metadata.

## Migration Plan

1. Add the dark favicon asset derived from the approved negative logo.
2. Add the three favicon links to the shared document head.
3. Run focused metadata tests and a production static export; inspect `/` and `/en` output.
4. Manually smoke-test light, dark, and cache-cleared fallback behavior in a standards-compliant browser such as Chrome.

Rollback removes the three explicit links and the new dark asset, restoring the existing file-based favicon behavior without data migration.
