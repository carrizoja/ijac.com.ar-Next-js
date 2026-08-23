## Context

The application uses the Next.js App Router and already defines `src/app/not-found.tsx`. The root layout wraps all page content with the desktop/mobile navigation, AI chat, footer, and cookie consent, so the replacement must coexist with that shell rather than reproduce it. Dynamic service routes already call `notFound()` for unknown slugs. See `proposal.md` for motivation and `specs/invalid-route-recovery/spec.md` for observable behavior.

## Goals / Non-Goals

**Goals:**
- Use the framework's root not-found boundary for unmatched URLs and missing dynamic content.
- Keep the page a lightweight server component with a responsive, brand-consistent visual treatment.
- Preserve a real 404 response while giving visitors a direct recovery path.
- Make the content and action understandable without animation or client-side JavaScript.

**Non-Goals:**
- Redirect invalid requests automatically to the home page.
- Add route-specific not-found variants, search, telemetry, or new dependencies.
- Change the shared navbar, footer, chat, consent, or service lookup behavior.

## Decisions

### Keep the root `not-found.tsx` convention

Replace the existing component in place. Next.js uses the root not-found boundary for completely unmatched URLs and for `notFound()` calls, preserving a 404 response and automatically adding `noindex` metadata. A catch-all route or middleware redirect was rejected because it would duplicate framework routing, risk changing status semantics, and conceal broken URLs.

### Use a server-rendered recovery page

The component will remain free of client directives and runtime state. The home action will use `next/link`, while atmosphere and any entrance treatment will use responsive Tailwind utilities and CSS that respects `prefers-reduced-motion`. A motion component was rejected because a recovery page should remain small, dependable, and usable before hydration.

### Follow the existing dark visual system with a focused composition

The page will use the established black/neutral surface, heading font, white text, and blue/cyan accent family, but avoid the current generic blue-purple gradient card. A restrained technical motif around the oversized `404`, concise Spanish copy, and one prominent home link will create hierarchy without competing with the shared shell. Decorative elements will be hidden from assistive technology.

### Add page-specific metadata

Export static metadata from the not-found module with a Spanish title and description. Next.js supplies the noindex directive for 404 responses, so no custom robots logic is needed.

## Risks / Trade-offs

- [The root layout's fixed navigation and shared footer can make viewport-height sizing overflow] → Use shell-aware spacing and content-driven minimum heights instead of assuming the page owns the full viewport.
- [Decorative effects can reduce contrast or create mobile overflow] → Keep effects non-interactive, clipped within the page, and verify text/action contrast at narrow and wide widths.
- [An automatic home redirect may appear simpler] → Preserve the 404 and require an explicit visitor action so broken links remain observable and browser navigation remains predictable.

## Migration Plan

1. Replace the existing root not-found presentation without changing its file convention.
2. Validate a completely unmatched URL and an unknown service slug in development or production build output.
3. Verify responsive layout, keyboard focus, and reduced-motion behavior.
4. Roll back by restoring the previous `src/app/not-found.tsx`; no data or configuration migration is required.
