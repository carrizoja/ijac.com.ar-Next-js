## Exploration: full-site-es-en-localization

### Current State

The site is a Next.js 16 App Router application exported as static files (`output: "export"`, `trailingSlash: true`) for Hostinger. Spanish is hardcoded throughout the root layout, pages, shared components, data modules, metadata, JSON-LD, sitemap, cookie UI, and deterministic chatbot. The current route set is `/`, `/contact`, `/services`, `/services/[slug]`, `/politica-de-privacidad`, and `/terminos-y-condiciones`, plus the generated 404. Service detail routes are pre-rendered through `generateStaticParams`.

There is no i18n dependency. Next.js supports statically generated locale segments, but `next-intl` documents that static export without middleware requires every locale to be prefixed. Its `as-needed` mode needs middleware, so it cannot directly satisfy unprefixed Spanish plus `/en/...`. A client-only locale switch would also leave English HTML emitted with `lang="es"`, incorrect metadata, and weaker indexability.

Content ownership is fragmented. Marketing copy lives in page/component JSX; service copy and stable slugs live in `src/data/services.js`; staff roles and testimonial display fields live in data files; business facts and Spanish WhatsApp/hour strings share `src/data/business.ts`; SEO copy is embedded in route metadata and JSON-LD. Testimonial quotations are third-party Spanish source material and should not be silently rewritten as English originals. Legal translations and the chatbot's contract-marked, owner-approved fallback wording require explicit content approval.

The chatbot API contract already accepts `es`, `en`, and `pt`, and its unknown-response copy already includes English. However, `AIChat` fixes the language to `es`; all widget labels, prompts, dates, and welcome text are Spanish; and the 460-line deterministic `chatEngine` consumes Spanish service data and returns Spanish responses. Locale therefore must be passed from the route shell through the widget, deterministic engine, and API request rather than detected at runtime.

SEO currently has one Spanish root metadata object, hardcoded Spanish JSON-LD, and a sitemap containing only unprefixed URLs. Canonicals exist on principal pages but no `hreflang` pairs or `x-default`. Both legal pages are `noindex, nofollow` while still listed in the sitemap, an existing contradiction that should be resolved before defining localized alternates. Static hosting also produces one generic `404.html`; an English invalid URL cannot receive a fully correct server-selected status document, metadata, and `<html lang="en">` without Hostinger-level locale-aware error mapping.

The working tree already contains overlapping uncommitted changes to navigation, homepage composition, service cards, contact/FAQ placement, the TeamViewer banner, Vitest aliasing, and their tests. These changes are current source of truth and MUST be isolated or used as the baseline rather than overwritten. Their tracked diff is 138 changed lines and the six new production/test files add 305 lines before localization work.

### Affected Areas
- `next.config.ts`, `src/app/layout.tsx` — static-export constraints, root-shell organization, locale-specific `<html lang>`, and global metadata.
- `src/app/page.tsx`, `src/app/contact/page.tsx`, `src/app/services/page.tsx`, `src/app/services/[slug]/page.tsx` — localized route mirrors, metadata, JSON-LD, breadcrumbs, internal links, and static params.
- `src/app/politica-de-privacidad/page.tsx`, `src/app/terminos-y-condiciones/page.tsx`, `src/app/not-found.tsx` — legal and recovery copy, date formatting, locale-aware navigation, and indexability decisions.
- `src/app/components/Navbarijac.tsx`, `src/app/components/HamburgerMenu.tsx`, `src/app/components/ClientRedirect.tsx` — accessible ES/EN controls, current-path preservation, localized section links, mobile state, and legacy redirect behavior.
- `src/app/components/Hero.tsx`, `About.tsx`, `OurStaff.tsx`, `Services.tsx`, `RemoteSupportBanner.tsx`, `Testimonials.tsx`, `Contact.tsx`, `FAQ.tsx`, `Footer.tsx` — homepage and shared visible copy.
- `src/app/components/CookieConsent.tsx`, `BackButton.tsx`, `Breadcrumbs.tsx`, `WhatsApp.tsx`, `src/app/components/ui/{focus-cards,PrimaryButton,SecondaryButton,navbar-menu}.tsx` — shared labels, legal links, structured breadcrumbs, and locale-aware href generation.
- `src/data/services.js`, `src/data/staff.js`, `src/data/testimonials.js`, `src/data/business.ts` — separation of invariant facts/identifiers from approved localized content.
- `src/app/components/AIChat.tsx`, `src/app/components/chat/{chatEngine,hybridChat,chatApi}.ts`, `packages/contracts/chat.ts`, `chat-api/` — selected route locale, deterministic responses, request language, and provider/contract behavior.
- `src/app/components/StructuredData.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts` — per-locale JSON-LD, canonical/alternate URL inventory, and crawl policy.
- `src/app/components/*.test.tsx`, `src/app/components/chat/*.test.ts`, `src/app/{page,contact/page}.test.tsx`, `chat-api/**/*.test.ts`, `packages/contracts/chat.test.ts` — localized rendering, navigation, accessibility, static routing, and chatbot-language contracts.

### Approaches
1. **Route groups with two static root layouts and shared locale-aware views** — Move Spanish routes under a URL-neutral route group and place English routes under `/en`, with each group owning a real root layout (`<html lang="es">` or `<html lang="en">`). Shared page views receive typed dictionaries and locale-aware route helpers; stable service slugs remain identical in both mirrors.
   - Pros: Meets unprefixed-Spanish and `/en/...` requirements; emits correct HTML language and metadata at build time; works without middleware/cookies; keeps rendering components shared; provides deterministic path-preserving switching.
   - Cons: Requires careful App Router restructuring; global 404 behavior needs a hosting decision; metadata and route wrappers add controlled duplication; route conflicts/build output must be tested early.
   - Effort: High

2. **Keep the current root tree and add a duplicated `/en` page tree** — Leave Spanish pages in place, add English pages beneath `src/app/en`, and share only selected components/dictionaries.
   - Pros: Lowest migration risk for existing Spanish URLs; easy incremental delivery; static export naturally emits the English mirror.
   - Cons: The current root layout fixes `<html lang="es">`, so nested English routes cannot produce a semantically correct document without restructuring or client mutation; page/metadata drift and copy duplication are likely.
   - Effort: Medium initially, High over time

3. **Adopt `next-intl` locale routing** — Place all pages under a dynamic locale segment and use framework dictionaries/navigation helpers.
   - Pros: Mature ICU formatting, typed message workflows, and established locale APIs.
   - Cons: Under static export, `next-intl` requires always-prefixed routes and no locale negotiation; its unprefixed-default strategy depends on middleware. It therefore conflicts with Spanish at existing URLs unless Spanish is duplicated or redirected, recreating much of Approach 1.
   - Effort: High

### Recommendation

Use Approach 1 with a small custom, typed localization layer. Create locale-neutral route helpers for `localizePath`, `stripLocalePrefix`, canonical URLs, and path-preserving switching; keep Spanish as `/...` and map English to `/en/...` with the same service slugs and section fragments. Split content into domain dictionaries rather than one giant message file: shared/navigation, homepage, services, contact/legal, SEO/structured data, and chat. Keep business identifiers, contact facts, service IDs/slugs, images, ratings, and source URLs invariant; localize display text around them. Preserve original testimonial quotations with `lang="es"` on English pages unless the product owner approves clearly labeled translations.

Use actual links for the language controls, not buttons that mutate state. Each control should expose its destination, localized accessible name (for example, “View this page in English”), visible text beyond flags, a minimum 24×24 CSS-pixel target (prefer 44×44), `lang`/`hreflang`, keyboard focus, and `aria-current` for the active language. Mobile switching should close the menu through existing state behavior. Avoid announcing a full page navigation through a live region.

Every indexable route should have a self-canonical plus `alternates.languages` for `es`, `en`, and `x-default` (Spanish), locale-correct Open Graph/Twitter fields, and paired sitemap entries. JSON-LD names/descriptions/URLs/breadcrumbs must match the rendered locale. Decide whether legal pages remain `noindex`; if they do, remove them from the sitemap and do not rely on `hreflang` for those pages.

The forecast is a HIGH 400-line-budget risk. Use a feature branch chain with five independently testable slices, each targeted below 400 authored changed lines: (1) locale types/dictionaries, route helpers, dual static layouts, and route/build tests (250–350); (2) desktop/mobile switchers plus global shell, footer, cookies, and accessibility tests (220–320); (3) homepage sections and localized content/data, preserving service-card and TeamViewer changes (300–390); (4) services, contact/FAQ, legal pages, and localized metadata (300–390); (5) chatbot language flow, JSON-LD, sitemap/robots, 404 handling, and final integration tests (280–380). Before apply, isolate the existing 443-line overlapping working-tree baseline into reviewable commits/PR slices or explicitly establish it as the parent branch; never reset or regenerate those files from `HEAD`.

### Risks
- Static export has one generic `404.html`; English 404 semantics need Hostinger error-routing evidence or an explicitly accepted client-selected compromise.
- Multiple root layouts and route groups can cause route conflicts or full document navigation; prove the route skeleton with `next build` before translating all copy.
- The existing uncommitted baseline overlaps the highest-change localization files and already exceeds 400 lines when tracked and new files are counted together.
- Legal English copy, marketing claims, service descriptions, testimonial treatment, and contract-marked chatbot wording need named human approval; engineering should own keys and invariants, not final translations.
- Stable service slugs are consumed by pages and chatbot logic; translating slugs would multiply route mappings, redirects, SEO risk, and knowledge coupling.
- Existing Spanish deterministic chatbot responses are tightly coupled to Spanish service data; partial localization could send `language: "en"` while still rendering Spanish deterministic answers.
- Current sitemap inclusion conflicts with legal-page `noindex`; blindly adding alternates would propagate inconsistent crawl signals.
- Cookie consent storage should remain consent-only, not become a locale preference mechanism; locale must remain URL-derived.

### Ready for Proposal

Yes. The proposal should adopt the dual-static-root/custom-dictionary direction, require same-slug `/en` mirrors and URL-derived chatbot language, assign human translation approval, and record two explicit pre-apply decisions under `ask-on-risk`: approve the chained PR strategy and choose the English 404/Hostinger handling. It should also make preservation and isolation of the current uncommitted baseline a non-negotiable prerequisite.
