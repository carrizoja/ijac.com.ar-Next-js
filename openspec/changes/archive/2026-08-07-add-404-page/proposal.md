## Why

Invalid URLs currently fall through to a generic, visually disconnected not-found screen that does not fully match the site's navigation and brand experience. Visitors need a clear, accessible recovery path while the application preserves proper 404 behavior for browsers and search engines.

## What Changes

- Replace the existing not-found placeholder with a responsive, brand-consistent 404 page.
- Route every unmatched App Router URL to the custom not-found experience while retaining the 404 response status.
- Provide concise Spanish guidance and a prominent link back to the home page.
- Ensure the page remains usable with the shared site shell on mobile and desktop and respects reduced-motion preferences.

## Capabilities

### New Capabilities
- `invalid-route-recovery`: Defines the not-found experience and recovery behavior for unmatched application routes.

### Modified Capabilities

None.

## Impact

- Replaces the presentation in `src/app/not-found.tsx`.
- Uses the existing Next.js App Router not-found convention and shared layout; no new route handler or dependency is required.
- Affects navigation behavior for all invalid public URLs, responsive presentation, accessibility, and 404 metadata/semantics.
