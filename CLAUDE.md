# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Dev server with Turbopack (default port 3000)
npm run build    # Production build → static export to out/
npm run export   # Alias for build (produces the same out/ directory)
npm run lint     # ESLint 9 flat config from eslint.config.mjs
npm test         # Vitest (vitest.config.mts, node environment)
npx tsc --noEmit # Typecheck
```

`npm start` exists but is not the deploy target — see "Static export" below.

### Lint

`next lint` was removed in Next.js 16, so the script calls `eslint` directly and ESLint
auto-discovers `eslint.config.mjs`. `eslint-config-next` ships **native flat configs** —
`eslint-config-next/core-web-vitals` and `/typescript` both default-export arrays that are
spread straight into the config. Do not reintroduce `FlatCompat`: it only translates legacy
eslintrc configs, and feeding it a flat array crashes the validator with a misleading
"Converting circular structure to JSON" from the error formatter, masking the real cause.

### Tests

Vitest, `node` environment by default. Component tests opt into jsdom with a
`// @vitest-environment jsdom` pragma on the first line. Tests live beside their subject
(`*.test.ts` / `*.test.tsx`). `strict_tdd` is enabled in `openspec/config.yaml` — write the
failing test first.

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

The site is bilingual. Spanish is unprefixed (`/`), English lives under `/en`. There is
**no single `src/app/layout.tsx`** — each locale has its own root layout so the static HTML
carries the correct build-time `<html lang>`:

- `src/app/(es)/layout.tsx` — Spanish root layout. `(es)` is a route group, so it adds nothing to the URL. Uses `spanishMetadata` from `SiteDocument`.
- `src/app/en/layout.tsx` — English root layout. Only sets `metadataBase`; English pages supply their own metadata.
- `src/app/components/SiteDocument.tsx` — the shared `<html>`/`<body>` both layouts render with a `locale` prop. It owns fonts (Inter + Space Grotesk via `next/font`), the theme bootstrap script, Google Analytics, and the chrome (NavbarIjac at ≥760px, HamburgerMenu below, Footer, AIChat, CookieConsent, ClientRedirect, PerformanceMonitor). Change document-wide concerns here, not in a layout.
- `src/app/global-not-found.tsx` — the 404 is a complete document (`experimental.globalNotFound` in `next.config.ts`), rendered through `SiteDocument` with `locale="es"`.

Routes (Spanish under `src/app/(es)/`, English under `src/app/en/`):

- `page.tsx` — anchor-navigated home (Hero / Services / About / Testimonials / FAQ / Contact), each in a `<section id="...">`. Section IDs are locale-specific and part of the public URL contract: Spanish `servicios`, `nosotros`, `testimonios`, `contacto`; English `services`, `about`, `testimonials`, `contact`. The map lives in `homeSectionIds` in `src/i18n/routing.ts`; `ClientRedirect` and the navigation resolve hrefs through it.
- `services/page.tsx` and `services/[slug]/page.tsx` — services listing and detail pages. English slugs differ from the canonical Spanish ones; the mapping is in `src/i18n/services/catalog.ts`.
- `contact/page.tsx` — both locales.
- `politica-de-privacidad/`, `terminos-y-condiciones/` — Spanish only.

### Localization

- `src/i18n/routing.ts` — locale helpers (`getLocaleFromPath`, `localizePath`, `getLocaleHref`, `getNavHref`, `availableEnglishPaths`). Locale is always derived from the URL (`usePathname()` in client components); there is no locale storage or middleware.
- Copy lives in `src/i18n/` as `Record<Locale, …>` modules (`chrome/`, `home/`, `services/`, `faq.ts`, `chat.ts`, `theme.ts`, `seo.ts`, `structured-data.ts`). New user-facing text goes there, not inline in components.
- When adding an English route, also add it to `availableEnglishPaths` so the language toggle links to it instead of falling back to `/en`.

### Legacy URL handling

`src/app/components/ClientRedirect.tsx` is mounted in `SiteDocument` and runs on every navigation. It maps legacy paths (`/about`, `/servicios`, `/wp-admin`, `*.html`, `*.php`, …) to the anchor sections or pages of the home, keeping the visitor inside their locale (`/en/servicios` → `/en/services`). This is how the static export handles inbound links from the old WordPress site — when adding new section IDs or routes, update the `redirectMap` so old URLs keep resolving.

### Styling

- **Tailwind CSS v4** configured via `@import "tailwindcss"` in `src/app/globals.css` — there is no `tailwind.config.ts`. Theme tokens (colors, radii, fonts) are defined as CSS variables under `@theme inline` in `globals.css` and overridden in `.dark`.
- Fonts: Inter (`--font-inter`, body) and Space Grotesk (`--font-space-grotesk`, headings) loaded via `next/font/google`; SphereFez declared via `@font-face` from `/public/fonts/`. Use the `font-heading` / `font-body` utility classes from `globals.css`.
- shadcn/ui is configured (`components.json`, "new-york" style, lucide icons, `@/components/ui` alias) but components live under `src/app/components/ui/` rather than `src/components/ui/` — the shadcn alias resolves there because of the `@/* → ./src/*` path mapping plus how files are referenced. New shadcn components added via the CLI may land in a different path; verify before importing.
- `cn()` helper at `src/app/lib/utils.tsx` (clsx + tailwind-merge).

### Light / dark theme

Dark is the default; light is an opt-in remembered per visitor. Design rationale: `docs/superpowers/specs/2026-09-15-light-mode-design.md`.

- `SiteDocument` always ships `<html class="dark">`. An inline, synchronous `themeBootstrapScript` in `<head>` removes the class before first paint only when `localStorage['ijac-theme'] === 'light'`. First visits are always dark — the OS `prefers-color-scheme` is deliberately ignored. Keep that script inline; a deferred script would flash.
- `src/app/lib/theme.ts` — storage and application logic. `localStorage` is the single source of truth, read through `useSyncExternalStore`; every access is wrapped because storage can throw, and the failure mode is "stays dark".
- `src/app/components/ThemeToggle.tsx` — sun/moon icon button, mounted in both NavbarIjac and HamburgerMenu. Labels come from `src/i18n/theme.ts`.
- Theming uses the `.dark` class (Tailwind `dark:` variant), not `data-theme`. **Every dark-only color class needs a light counterpart** (`text-gray-900 dark:text-white`); a missed pair is invisible text that you won't notice while developing in dark.
- Intentionally dark in both themes: Contact, `RemoteSupportBanner`, `Footer`, and `NotFoundContent` (their glass/glow effects need a dark ground). Don't "fix" them to light.

### Path alias

`@/*` → `./src/*` (see `tsconfig.json`). Most existing imports use relative paths within `src/app/`; prefer matching the surrounding file's style.

### SEO surface

Three coordinated pieces — keep them in sync when business info changes:

1. `spanishMetadata` in `src/app/components/SiteDocument.tsx` (title template, OG, Twitter, keywords, `metadataBase`), plus per-page English metadata. `src/i18n/seo.ts` builds the hreflang `alternates`.
2. `src/app/components/StructuredData.tsx` — JSON‑LD `Organization` + `LocalBusiness` schema (phone, address, geo), taking a `locale` prop; localized fields come from `src/i18n/structured-data.ts`. Rendered from both home pages.
3. `src/app/sitemap.ts` + `src/app/robots.ts` — must list any new public routes. The sitemap emits reciprocal ES/EN pairs with shared hreflang alternates, and URLs need the trailing slash.

### Analytics & performance

- GA4 (`G-8NYPRQK16F`) is hardcoded in `SiteDocument.tsx` via `next/script` with `strategy="lazyOnload"`.
- `PerformanceMonitor.tsx` reports Core Web Vitals (LCP/FID/CLS/FCP/TTFB) to GA via `gtag('event', ...)`. It runs only when `window.gtag` exists, so it's a no‑op without consent/GA loaded.
- `CookieConsent.tsx` handles GDPR‑style consent banner.

### Notable extras

- `src/app/components/AIChat.tsx` is a sizeable client‑side chat widget mounted globally in the layout. It runs entirely in the browser since there is no server runtime.
- `scripts/` contains Cloudinary favicon generation utilities (`cloudinary-favicons.js`, `setup-favicon.js`, `generate-favicons.sh`) — see `FAVICON-SETUP.md`. These are one‑shot tooling, not part of the build.
- Topic‑specific docs in repo root: `HOSTINGER-DEPLOYMENT.md`, `IMAGE-OPTIMIZATION.md`, `GOOGLE-ANALYTICS-SETUP.md`, `SEO-ROBOTS-FIX.md`, `UPLOAD-CHECKLIST.md`. Consult these before changing the corresponding subsystem.
