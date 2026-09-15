# Light mode — design

**Date:** 2026-09-15
**Status:** Approved, not yet implemented
**Branch:** `feat/light-mode`

## Problem

The site is dark-only: `SiteDocument` renders `<html className="dark">` unconditionally. There is no way for a visitor to read it on a light ground, which matters most on the text-heavy service pages.

Adding a toggle is not the hard part. Of 30 component and page files, 20 already pair every dark class with a light one and need no change. Ten are hard-committed to dark — they use literal Tailwind colours with no light counterpart, because they were designed dark rather than themed dark.

## Decisions

Three product decisions were made before design and constrain everything below.

### 1. Dark bands are retained in light mode

Contact, `RemoteSupportBanner` and `Footer` stay dark in **both** themes, as deliberate full-bleed bands punctuating a light page.

This is not a shortcut. Those sections use `bg-white/10` glass cards over a dark gradient — an effect that depends on a dark ground and has no light equivalent. Recolouring them would mean replacing the device, not translating it. Keeping them dark preserves the brand's character in light mode and reduces the designs to invent from six to two.

### 2. First visit is always dark

Every visitor lands on dark regardless of their OS `prefers-color-scheme`. The toggle is a deliberate opt-out, remembered thereafter. Clearing site data returns to dark.

This keeps the brand's first impression identical for everyone and makes the paint-blocking script a single `localStorage` read — no `matchMedia`, no OS branch.

### 3. The toggle is an icon in the navbar

A single sun/moon icon button beside the language toggle on desktop, and in the drawer on mobile. The navbar pill is `max-w-2xl` and already carries the logo, four Spanish nav items and the ES/EN toggle, so the control must be icon-only; a labelled control does not fit.

## Architecture

### Token layer — unchanged in structure

`globals.css` already defines the complete light palette on `:root` and overrides it under `.dark`. The only token change is the light ground:

- `:root { --background }` moves from pure white `oklch(1 0 0)` to `oklch(0.985 0.003 85)` — an off-white carrying a faint warm bias, so the neutral reads as chosen rather than inherited.
- `:root { --card }` stays pure white `oklch(1 0 0)`.

That relationship is the point. The dark design separates cards from ground by making cards *lighter* than black; light mode inverts it, so the ground must sit below pure white for white cards to lift off it.

### Theme application

`SiteDocument` continues to render `className="dark"` as the shipped default, and gains a blocking `<script>` in `<head>` that reads `localStorage` and swaps the class to light before first paint.

Because dark is the universal default, a first-time visitor needs no correction at all — there is no flash. Only a returning light-mode visitor is corrected, pre-paint.

Both root layouts (`(es)` and `en`) share `SiteDocument`, so this lands in one place.

**Why a class, not `data-theme`:** Tailwind v4's `dark:` variant keys on `.dark`, and the 20 already-correct files depend on it. Switching to an attribute would require a custom variant and churn every one of them for no benefit.

**Static export constraint:** `output: 'export'` means no server can read a preference and no HTML can be personalised. The blocking script is the only mechanism available; it must be inline and synchronous, because a deferred or external script runs after first paint.

## Components

| File | Purpose |
| --- | --- |
| `src/i18n/theme.ts` | Accessible labels per locale, following the established `Record<Locale, …>` pattern |
| `src/app/components/ThemeToggle.tsx` | Client component; icon button, reads and writes storage, toggles the root class |
| `src/app/lib/theme.ts` | `resolveTheme(stored)` — pure, DOM-free, so the storage rule is unit-testable |

`ThemeToggle` follows `LanguageToggle`'s shape: locale from `usePathname()`, copy from the i18n module, a real `<button>` with an accessible name, a 44px touch target, and a visible focus ring.

## The light designs

Two surfaces need a light design invented: the **services listing** and the **service detail** page. Each is one design shared across both locales, since the ES and EN files duplicate the same layout.

Two more are mechanical completions rather than new designs: `NotFoundContent` (seven unpaired classes, conventional layout) and `Testimonials` (already half-paired). They follow the table below without further design decisions.

| Element | Dark (today) | Light |
| --- | --- | --- |
| Ground | `bg-black` | warm off-white via `--background` |
| Cards | `bg-neutral-950/80`, `border-white/10` | white, hairline border, soft shadow |
| Headings | `text-white` | near-black |
| Body | `text-neutral-300` | `text-neutral-700` |
| Accent | emerald | emerald, unchanged |

The accent stays because it reads on both grounds, which is what keeps the two themes recognisably the same site.

## Testing

- `resolveTheme` — unit tested directly; no DOM needed.
- `ThemeToggle` — render, toggle, persistence, and accessible name in both locales.
- Redesigned pages — assert every dark class has a light counterpart. This is the real regression risk: a missed pair means invisible text, and it is invisible in the dark theme the developer is looking at.
- Existing suite must stay green. Spanish and English rendered copy must not change; this is a theming change only.

## Scope

**Changes:** `SiteDocument.tsx`, `Navbarijac.tsx`, `HamburgerMenu.tsx`, `globals.css`, the two services pages ×2 locales, `NotFoundContent.tsx`, `Testimonials.tsx`, plus the three new files above.

**Untouched:** the 20 theme-ready files, all copy and i18n modules, routing, sitemap, structured data.

**Excluded:** `WhatsApp.tsx` is mounted nowhere and is dead code. Contact, `RemoteSupportBanner` and `Footer` stay dark by decision 1, not by omission.

## Risks

- **A missed class pair renders invisible text.** Mitigated by the pairing tests, and by reviewing both themes in the browser before merge.
- **The navbar is tight between 700px and 760px**, where the hamburger has just given way to the full pill. The nav gap may need tightening a notch; check at exactly 700px.
- **`localStorage` throws in some privacy modes.** Every read and write must be wrapped; the failure mode is "stays dark", never a broken page.
