# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Dev server with Turbopack (default port 3000)
npm run build    # Production build → static export to out/
npm run export   # Alias for build (produces the same out/ directory)
npm run lint     # ESLint via next lint (next/core-web-vitals + next/typescript)
```

There is no test suite configured. `npm start` exists but is not the deploy target — see "Static export" below.

## Repo conventions (from AGENTS.md)

- **Reply to users in English**, regardless of the language of the code/content (the site itself is in Spanish, locale `es_AR`).

## Architecture

This is a **statically-exported Next.js 16 site** for iJac IT Solutions (https://ijac.com.ar). The output is a folder of HTML/JS/CSS uploaded to Hostinger — there is no Node server in production.

### Static export — the constraint that shapes everything

`next.config.ts` sets `output: 'export'` and `trailingSlash: true`. Consequences that affect every change:

- **No API routes, no Server Actions, no middleware, no ISR.** Anything dynamic must be a client component or third‑party (e.g. analytics, the AIChat widget).
- `images.unoptimized: true` is required — the `next/image` optimizer would need a server. Remote image domains (Cloudinary, `assets.aceternity.com`) are still listed in `remotePatterns` so the components can keep using `<Image>` URLs cleanly.
- Route segments that emit metadata files (`sitemap.ts`, `robots.ts`) declare `export const dynamic = 'force-static'` and `revalidate = false` so they're emitted as static `sitemap.xml` / `robots.txt`. New metadata routes must do the same.
- Security headers are configured at the web server (Hostinger), **not** in `next.config.ts` — header config in next.config has no effect with static export.
- After `npm run build`, deploy by uploading the **contents** of `out/` (not the folder itself) to `public_html/`. Details in `HOSTINGER-DEPLOYMENT.md`.

### Page structure

The site is a single anchor‑navigated page plus three legal/contact pages:

- `src/app/page.tsx` — composes Hero / Services / About / Testimonials / FAQ / Contact, each wrapped in a `<section id="...">` so the navbar can scroll to them. The section IDs (`servicios`, `nosotros`, `testimonios`, `faq`, `contacto`) are part of the public URL contract — `ClientRedirect` and `Navbarijac` both reference them.
- `src/app/contact/page.tsx`, `src/app/politica-de-privacidad/`, `src/app/terminos-y-condiciones/` — standalone routes.
- `src/app/layout.tsx` — root layout. Forces `<html className="dark">` (the site is dark‑mode only), wires Inter + Space Grotesk via `next/font`, injects Google Analytics via `next/script`, and renders the chrome (NavbarIjac for ≥700px, HamburgerMenu below, Footer, AIChat, CookieConsent).

### Legacy URL handling

`src/app/components/ClientRedirect.tsx` is mounted in the root layout and runs on every navigation. It maps legacy paths (`/services`, `/about`, `/wp-admin`, `*.html`, `*.php`, …) to either the anchor sections on `/` or to `/`. This is how the static export handles inbound links from the old WordPress site — when adding new section IDs or routes, update the `redirectMap` so old URLs keep resolving.

### Styling

- **Tailwind CSS v4** configured via `@import "tailwindcss"` in `src/app/globals.css` — there is no `tailwind.config.ts`. Theme tokens (colors, radii, fonts) are defined as CSS variables under `@theme inline` in `globals.css` and overridden in `.dark`.
- Fonts: Inter (`--font-inter`, body) and Space Grotesk (`--font-space-grotesk`, headings) loaded via `next/font/google`; SphereFez declared via `@font-face` from `/public/fonts/`. Use the `font-heading` / `font-body` utility classes from `globals.css`.
- shadcn/ui is configured (`components.json`, "new-york" style, lucide icons, `@/components/ui` alias) but components live under `src/app/components/ui/` rather than `src/components/ui/` — the shadcn alias resolves there because of the `@/* → ./src/*` path mapping plus how files are referenced. New shadcn components added via the CLI may land in a different path; verify before importing.
- `cn()` helper at `src/app/lib/utils.tsx` (clsx + tailwind-merge).

### Path alias

`@/*` → `./src/*` (see `tsconfig.json`). Most existing imports use relative paths within `src/app/`; prefer matching the surrounding file's style.

### SEO surface

Three coordinated pieces — keep them in sync when business info changes:

1. `src/app/layout.tsx` — `metadata` (title template, OG, Twitter, keywords, `metadataBase`).
2. `src/app/components/StructuredData.tsx` — JSON‑LD `Organization` + `LocalBusiness` schema (phone, address, geo). Rendered from `page.tsx`.
3. `src/app/sitemap.ts` + `src/app/robots.ts` — must list any new public routes.

### Analytics & performance

- GA4 (`G-8NYPRQK16F`) is hardcoded in `layout.tsx` via `next/script` with `strategy="lazyOnload"`.
- `PerformanceMonitor.tsx` reports Core Web Vitals (LCP/FID/CLS/FCP/TTFB) to GA via `gtag('event', ...)`. It runs only when `window.gtag` exists, so it's a no‑op without consent/GA loaded.
- `CookieConsent.tsx` handles GDPR‑style consent banner.

### Notable extras

- `src/app/components/AIChat.tsx` is a sizeable client‑side chat widget mounted globally in the layout. It runs entirely in the browser since there is no server runtime.
- `scripts/` contains Cloudinary favicon generation utilities (`cloudinary-favicons.js`, `setup-favicon.js`, `generate-favicons.sh`) — see `FAVICON-SETUP.md`. These are one‑shot tooling, not part of the build.
- Topic‑specific docs in repo root: `HOSTINGER-DEPLOYMENT.md`, `IMAGE-OPTIMIZATION.md`, `GOOGLE-ANALYTICS-SETUP.md`, `SEO-ROBOTS-FIX.md`, `UPLOAD-CHECKLIST.md`. Consult these before changing the corresponding subsystem.
