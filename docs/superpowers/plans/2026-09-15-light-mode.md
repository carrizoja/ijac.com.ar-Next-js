# Light Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a visitor switch the site from its default dark theme to a light one, remembered across visits, with no flash of the wrong theme.

**Architecture:** `SiteDocument` keeps shipping `<html class="dark">` as the universal default and gains a synchronous inline script that removes the class before first paint when the visitor has previously chosen light. A client `ThemeToggle` in the navbar writes that preference. Tailwind v4's `dark:` variant already keys on `.dark`, so the 20 theme-ready files need no change; only the two services pages get a light design.

**Tech Stack:** Next.js 16 (App Router, `output: 'export'`), React 19, Tailwind CSS v4, TypeScript 5, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-15-light-mode-design.md`

## Global Constraints

- Static export: `output: 'export'`, `trailingSlash: true`. No server, middleware, API routes, or Server Actions.
- Dark is the universal first-visit default. Never read `prefers-color-scheme`.
- Every `localStorage` read and write is wrapped in `try/catch`; the failure mode is "stays dark", never a broken page.
- Code, identifiers, comments and test names in English. Spanish UI copy stays byte-identical (voseo).
- Rendered copy must not change in either locale. This is a theming change only.
- Baseline before starting: `npm test` = 58 files / 676 tests passing; `tsc --noEmit` clean; `lint` has exactly one pre-existing `chat-api/api/chat.ts` warning; `npm run build` emits 32 routes.
- Work in `/home/koche/ijac.com.ar` on branch `feat/light-mode`. Build ~10s, tests ~25s.

---

### Task 1: Theme resolution helper

**Files:**
- Create: `src/app/lib/theme.ts`
- Test: `src/app/lib/theme.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `type Theme = "dark" | "light"`, `THEME_STORAGE_KEY: string`, `resolveTheme(stored: string | null): Theme`, `readStoredTheme(): Theme`, `storeTheme(theme: Theme): void`, `themeBootstrapScript: string`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { resolveTheme, themeBootstrapScript, THEME_STORAGE_KEY } from "./theme";

describe("resolveTheme", () => {
  it("returns light only for the exact stored light value", () => {
    expect(resolveTheme("light")).toBe("light");
  });

  it("falls back to dark for anything else", () => {
    expect(resolveTheme("dark")).toBe("dark");
    expect(resolveTheme(null)).toBe("dark");
    expect(resolveTheme("")).toBe("dark");
    expect(resolveTheme("LIGHT")).toBe("dark");
    expect(resolveTheme("nonsense")).toBe("dark");
  });

  it("uses a namespaced storage key", () => {
    expect(THEME_STORAGE_KEY).toBe("ijac-theme");
  });
});

describe("themeBootstrapScript", () => {
  it("clears the dark class only for a stored light preference", () => {
    expect(themeBootstrapScript).toContain(THEME_STORAGE_KEY);
    expect(themeBootstrapScript).toContain("classList.remove('dark')");
    expect(themeBootstrapScript).toContain("'light'");
  });

  it("survives storage throwing in privacy modes", () => {
    expect(themeBootstrapScript).toMatch(/^try\{/);
    expect(themeBootstrapScript).toMatch(/catch\(e\)\{\}$/);
  });

  it("never consults the OS preference", () => {
    expect(themeBootstrapScript).not.toContain("matchMedia");
  });

  it("runs as one statement with no line breaks", () => {
    expect(themeBootstrapScript).not.toContain("\n");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/lib/theme.test.ts`
Expected: FAIL with `Cannot find module './theme'`

- [ ] **Step 3: Write minimal implementation**

```ts
export type Theme = "dark" | "light";

/** Namespaced so it cannot collide with anything else on the origin. */
export const THEME_STORAGE_KEY = "ijac-theme";

/**
 * Dark is the universal default: only the exact string "light" opts out.
 * Anything else — absent, empty, stale, corrupted — resolves to dark.
 */
export function resolveTheme(stored: string | null): Theme {
  return stored === "light" ? "light" : "dark";
}

/** Storage throws in some privacy modes; the failure mode is "stays dark". */
export function readStoredTheme(): Theme {
  try {
    return resolveTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "dark";
  }
}

export function storeTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Preference is not persisted; the current page still reflects the choice.
  }
}

/**
 * Inlined into <head> and run before first paint. The document ships with
 * class="dark", so a first visit needs no correction and cannot flash; only a
 * returning visitor who chose light is switched. Kept as a single-line string
 * so it is testable without rendering the document.
 */
export const themeBootstrapScript =
  `try{if(localStorage.getItem('${THEME_STORAGE_KEY}')==='light')` +
  `{document.documentElement.classList.remove('dark')}}catch(e){}`;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/lib/theme.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add src/app/lib/theme.ts src/app/lib/theme.test.ts
git commit -m "feat(theme): add theme resolution and storage helpers"
```

---

### Task 2: Pre-paint theme script

**Files:**
- Modify: `src/app/components/SiteDocument.tsx` (the `<head>` block at ~line 117)

**Interfaces:**
- Consumes: `themeBootstrapScript` from Task 1.
- Produces: nothing new; `SiteDocument`'s signature is unchanged.

**Why there is no component test here:** the existing `SiteDocument.test.tsx` deliberately never renders the component — it tests `spanishMetadata` only, because rendering a component that emits `<html>` and `<head>` inside jsdom needs `next/script` and `next/font` mocks for no real gain. Task 1 already tests the script's content directly; this task verifies the wiring against the real build output instead, which is stronger than a render assertion.

- [ ] **Step 1: Wire the script into the document head**

In `SiteDocument.tsx`, add the import:

```tsx
import { themeBootstrapScript } from "../lib/theme";
```

Insert the script as the **first child** of `<head>`, leaving `<html lang={locale} className="dark">` exactly as it is:

```tsx
      <head>
        {/*
          Runs before first paint. The document ships with class="dark", so a
          first-time visitor needs no correction and cannot flash; only a
          returning visitor who chose light is switched, pre-paint. Must stay
          inline and synchronous — a deferred script runs after the paint.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
```

- [ ] **Step 2: Build and verify the script reaches both locales**

```bash
npm run build >/dev/null 2>&1 && grep -c "ijac-theme" out/index.html out/en/index.html out/services/index.html
```
Expected: `1` for each file.

- [ ] **Step 3: Verify the shipped default is still dark**

```bash
grep -c 'class="dark"' out/index.html out/en/index.html
```
Expected: `1` for each — a first visit is unchanged.

- [ ] **Step 4: Confirm the existing suite still passes**

Run: `npm test`
Expected: all passing, unchanged count plus Task 1's 7 tests.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/SiteDocument.tsx
git commit -m "feat(theme): apply a stored light preference before first paint"
```

---

### Task 3: Toggle labels

**Files:**
- Create: `src/i18n/theme.ts`
- Test: `src/i18n/theme.test.ts`

**Interfaces:**
- Consumes: `Locale` from `@/i18n/routing`.
- Produces: `themeContent: Record<Locale, ThemeContent>` where `ThemeContent = { toLight: string; toDark: string }`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

import { themeContent } from "./theme";

describe("themeContent", () => {
  it("names the action, not the current state", () => {
    expect(themeContent.en.toLight).toBe("Switch to light mode");
    expect(themeContent.en.toDark).toBe("Switch to dark mode");
  });

  it("uses neutral professional Spanish", () => {
    expect(themeContent.es.toLight).toBe("Cambiar a modo claro");
    expect(themeContent.es.toDark).toBe("Cambiar a modo oscuro");
  });

  it("covers both locales", () => {
    for (const locale of ["es", "en"] as const) {
      expect(themeContent[locale].toLight.length).toBeGreaterThan(0);
      expect(themeContent[locale].toDark.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/i18n/theme.test.ts`
Expected: FAIL with `Cannot find module './theme'`

- [ ] **Step 3: Write minimal implementation**

```ts
import type { Locale } from "./routing";

export interface ThemeContent {
  /** Accessible name while dark is active — names the action, not the state. */
  toLight: string;
  /** Accessible name while light is active. */
  toDark: string;
}

export const themeContent: Record<Locale, ThemeContent> = {
  es: {
    toLight: "Cambiar a modo claro",
    toDark: "Cambiar a modo oscuro",
  },
  en: {
    toLight: "Switch to light mode",
    toDark: "Switch to dark mode",
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/i18n/theme.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/i18n/theme.ts src/i18n/theme.test.ts
git commit -m "feat(i18n): add theme toggle labels"
```

---

### Task 4: ThemeToggle component

**Files:**
- Create: `src/app/components/ThemeToggle.tsx`
- Test: `src/app/components/ThemeToggle.test.tsx`

**Interfaces:**
- Consumes: `Theme`, `readStoredTheme`, `storeTheme` (Task 1); `themeContent` (Task 3); `getLocaleFromPath` from `@/i18n/routing`.
- Produces: `ThemeToggle({ onToggle }: { onToggle?: () => void })`.

**Note on hydration:** the server cannot know the stored preference, so the button renders its dark-state label and reads storage in an effect after mount. The page itself is already correct pre-paint via Task 2; only the icon reconciles a moment later. Initial state must be `"dark"` so server and client markup match.

- [ ] **Step 1: Write the failing test**

```tsx
// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));

import { THEME_STORAGE_KEY } from "../lib/theme";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    navigation.pathname = "/";
    window.localStorage.clear();
    document.documentElement.classList.add("dark");
  });

  it("offers the light option while dark is active", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Cambiar a modo claro" })).toBeInTheDocument();
  });

  it("switches the document to light and remembers it", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Cambiar a modo claro" }));

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(screen.getByRole("button", { name: "Cambiar a modo oscuro" })).toBeInTheDocument();
  });

  it("switches back to dark", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Cambiar a modo claro" });
    fireEvent.click(button);
    fireEvent.click(screen.getByRole("button", { name: "Cambiar a modo oscuro" }));

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("localizes its accessible name on the English site", () => {
    navigation.pathname = "/en";
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
  });

  it("notifies the caller so a drawer can close", () => {
    const onToggle = vi.fn();
    render(<ThemeToggle onToggle={onToggle} />);
    fireEvent.click(screen.getByRole("button", { name: "Cambiar a modo claro" }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/components/ThemeToggle.test.tsx`
Expected: FAIL with `Cannot find module './ThemeToggle'`

- [ ] **Step 3: Write minimal implementation**

```tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { getLocaleFromPath } from "@/i18n/routing";
import { themeContent } from "@/i18n/theme";
import { readStoredTheme, storeTheme, type Theme } from "../lib/theme";

interface ThemeToggleProps {
  /** Lets the mobile drawer close itself after a choice. */
  onToggle?: () => void;
}

export function ThemeToggle({ onToggle }: ThemeToggleProps) {
  const pathname = usePathname();
  const copy = themeContent[getLocaleFromPath(pathname)];

  // Must start dark so server and client markup agree; the stored preference
  // is read after mount. The document itself is already correct by then.
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(readStoredTheme());
  }, []);

  const apply = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    storeTheme(next);
    setTheme(next);
    onToggle?.();
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={apply}
      aria-label={isDark ? copy.toLight : copy.toDark}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-neutral-400 dark:hover:text-neutral-100 dark:focus-visible:ring-offset-neutral-900"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="h-5 w-5"
      >
        {isDark ? (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
          </>
        )}
      </svg>
    </button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/components/ThemeToggle.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/app/components/ThemeToggle.tsx src/app/components/ThemeToggle.test.tsx
git commit -m "feat(theme): add the theme toggle control"
```

---

### Task 5: Mount the toggle

**Files:**
- Modify: `src/app/components/Navbarijac.tsx:112` (after `<LanguageToggle />`)
- Modify: `src/app/components/HamburgerMenu.tsx:198` (the `LanguageToggle` block)
- Test: `src/app/components/navigation.test.tsx` (exists — add cases)

**Interfaces:**
- Consumes: `ThemeToggle` (Task 4).
- Produces: nothing new.

- [ ] **Step 1: Write the failing test**

Append inside the existing `describe("primary navigation", …)` in `navigation.test.tsx`:

```tsx
  it("offers the theme toggle on the desktop navbar", () => {
    render(<NavbarIjac />);
    expect(
      screen.getByRole("button", { name: "Cambiar a modo claro" }),
    ).toBeInTheDocument();
  });

  it("offers the theme toggle in the mobile drawer", () => {
    render(<HamburgerMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir menú de navegación" }));
    expect(
      screen.getByRole("button", { name: "Cambiar a modo claro" }),
    ).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/components/navigation.test.tsx`
Expected: FAIL — `Unable to find an accessible element with the role "button" and name "Cambiar a modo claro"`

- [ ] **Step 3: Write minimal implementation**

In `Navbarijac.tsx`, add the import beside the existing `LanguageToggle` import:

```tsx
import { ThemeToggle } from "./ThemeToggle";
```

and place the control immediately after `<LanguageToggle />`:

```tsx
          <LanguageToggle />
          <ThemeToggle />
```

In `HamburgerMenu.tsx`, add the same import, then replace the toggle block:

```tsx
              <div className="mb-6 flex items-center justify-center gap-3">
                <LanguageToggle onNavigate={() => setIsOpen(false)} />
                <ThemeToggle />
              </div>
```

The drawer's theme toggle deliberately does **not** close the drawer — a visitor changing theme wants to see the result, not lose their place.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/components/navigation.test.tsx`
Expected: PASS

- [ ] **Step 5: Check the navbar at its tightest**

```bash
npm run build >/dev/null 2>&1 && echo "build ok"
```
Then open `/` at exactly 700px wide and confirm the pill does not wrap. If it does, reduce the nav link gap from `gap-x-2` to `gap-x-1.5` in `Navbarijac.tsx` and re-check.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/Navbarijac.tsx src/app/components/HamburgerMenu.tsx src/app/components/navigation.test.tsx
git commit -m "feat(theme): mount the theme toggle in both navigations"
```

---

### Task 6: Light ground token

**Files:**
- Modify: `src/app/globals.css:59` (`:root { --background }`)
- Test: `src/app/globals.test.ts` (create)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing importable; the token is consumed by CSS.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/app/globals.css", "utf-8");

function tokenIn(block: string, token: string): string {
  const start = css.indexOf(block);
  const body = css.slice(start, css.indexOf("}", start));
  // The colon matters: "--card" would otherwise match "--card-foreground".
  const match = body.match(new RegExp(`\\${token}\\s*:\\s*([^;]+);`));
  if (!match) throw new Error(`${token} not found in ${block}`);
  return match[1].trim();
}

describe("theme grounds", () => {
  it("gives light mode an off-white ground so white cards lift off it", () => {
    const background = tokenIn(":root {", "-background");
    const card = tokenIn(":root {", "-card");
    expect(background).toBe("oklch(0.985 0.003 85)");
    expect(card).toBe("oklch(1 0 0)");
    expect(background).not.toBe(card);
  });

  it("leaves the dark ground at pure black", () => {
    expect(tokenIn(".dark {", "-background")).toBe("#000000");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/globals.test.ts`
Expected: FAIL — `expected 'oklch(1 0 0)' to be 'oklch(0.985 0.003 85)'`

- [ ] **Step 3: Write minimal implementation**

In `src/app/globals.css`, inside `:root`, change only the background line:

```css
  --background: oklch(0.985 0.003 85);
```

Leave `--card: oklch(1 0 0);` and every `.dark` token untouched.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/globals.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/globals.test.ts
git commit -m "feat(theme): give light mode a considered off-white ground"
```

---

### Task 7: Light design for the services listing

**Files:**
- Modify: `src/app/(es)/services/page.tsx`
- Modify: `src/app/en/services/page.tsx`
- Create: `src/app/services-theme.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing importable.

Both files carry the same layout, so apply identical class changes to each. The mapping, applied to every occurrence:

| Dark (today) | Becomes |
| --- | --- |
| `bg-black` | `bg-background dark:bg-black` |
| `bg-neutral-950/80` | `bg-white shadow-sm dark:bg-neutral-950/80 dark:shadow-none` |
| `border-white/10` | `border-neutral-200 dark:border-white/10` |
| `border-white/8` | `border-neutral-200 dark:border-white/8` |
| `text-white` | `text-neutral-900 dark:text-white` |
| `text-neutral-200` | `text-neutral-800 dark:text-neutral-200` |
| `text-neutral-300` | `text-neutral-700 dark:text-neutral-300` |
| `text-neutral-400` | `text-neutral-600 dark:text-neutral-400` |
| `from-neutral-900` | `from-white dark:from-neutral-900` |
| `via-neutral-900` | `via-neutral-50 dark:via-neutral-900` |
| `via-neutral-950` | `via-neutral-50 dark:via-neutral-950` |
| `to-black` | `to-white dark:to-black` |

Emerald accent classes stay exactly as they are.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** Colour utilities that are invisible on a light ground unless paired. */
const DARK_ONLY = /\b(bg-black|bg-neutral-950\/80|text-white|text-neutral-[234]00|border-white\/\d+|from-neutral-900|via-neutral-9\d0|to-black)\b/;

function unpairedClasses(file: string): string[] {
  const source = readFileSync(file, "utf-8");
  const offenders: string[] = [];
  for (const match of source.matchAll(/className="([^"]*)"/g)) {
    const value = match[1];
    for (const token of value.split(/\s+/)) {
      if (!DARK_ONLY.test(token)) continue;
      if (value.includes(`dark:${token}`)) continue;
      offenders.push(token);
    }
  }
  return offenders;
}

describe.each([
  "src/app/(es)/services/page.tsx",
  "src/app/en/services/page.tsx",
])("%s", (file) => {
  it("pairs every dark-only colour with a light counterpart", () => {
    expect(unpairedClasses(file)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/services-theme.test.ts`
Expected: FAIL listing unpaired tokens such as `bg-black`, `text-white`, `border-white/10`

- [ ] **Step 3: Apply the mapping to both files**

Work through each `className` in both files and apply the table above. Example — the page wrapper:

```tsx
<main className="min-h-screen bg-background text-neutral-900 dark:bg-black dark:text-white">
```

and a card:

```tsx
<div className="grid overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-950/80 dark:shadow-none lg:grid-cols-[1.1fr_1.4fr]">
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/services-theme.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Confirm rendered copy did not change**

```bash
npm run build >/dev/null 2>&1 && grep -c "Servicios IT" out/services/index.html && grep -c "IT Services" out/en/services/index.html
```
Expected: non-zero for each.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(es)/services/page.tsx" src/app/en/services/page.tsx src/app/services-theme.test.ts
git commit -m "feat(theme): give the services listing a light design"
```

---

### Task 8: Light design for the service detail page

**Files:**
- Modify: `src/app/(es)/services/[slug]/page.tsx`
- Modify: `src/app/en/services/[slug]/page.tsx`
- Modify: `src/app/services-theme.test.ts` (extend the file list from Task 7)

**Interfaces:**
- Consumes: the `unpairedClasses` helper from Task 7's test file.
- Produces: nothing importable.

Apply the **same mapping table as Task 7** — it is repeated here so this task can be read on its own:

| Dark (today) | Becomes |
| --- | --- |
| `bg-black` | `bg-background dark:bg-black` |
| `bg-neutral-950/80` | `bg-white shadow-sm dark:bg-neutral-950/80 dark:shadow-none` |
| `border-white/10` | `border-neutral-200 dark:border-white/10` |
| `text-white` | `text-neutral-900 dark:text-white` |
| `text-neutral-200` | `text-neutral-800 dark:text-neutral-200` |
| `text-neutral-300` | `text-neutral-700 dark:text-neutral-300` |
| `text-neutral-400` | `text-neutral-600 dark:text-neutral-400` |
| `from-neutral-900` | `from-white dark:from-neutral-900` |
| `via-neutral-950` | `via-neutral-50 dark:via-neutral-950` |
| `to-black` | `to-white dark:to-black` |

The emerald "Specialized solution" pill and the emerald bullet dots stay unchanged.

- [ ] **Step 1: Write the failing test**

In `src/app/services-theme.test.ts`, extend the `describe.each` list:

```ts
describe.each([
  "src/app/(es)/services/page.tsx",
  "src/app/en/services/page.tsx",
  "src/app/(es)/services/[slug]/page.tsx",
  "src/app/en/services/[slug]/page.tsx",
])("%s", (file) => {
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/services-theme.test.ts`
Expected: FAIL on the two `[slug]` files listing unpaired tokens

- [ ] **Step 3: Apply the mapping to both detail files**

Example — the page wrapper and the "what's included" card:

```tsx
<main className="min-h-screen bg-background text-neutral-900 dark:bg-black dark:text-white">
```

```tsx
<div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-950/80 dark:shadow-xl sm:p-8">
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/services-theme.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add "src/app/(es)/services/[slug]/page.tsx" "src/app/en/services/[slug]/page.tsx" src/app/services-theme.test.ts
git commit -m "feat(theme): give the service detail page a light design"
```

---

### Task 9: Full verification

**Files:** none modified.

- [ ] **Step 1: Run the whole suite**

Run: `npm test`
Expected: all passing, at least 676 + 16 new tests

- [ ] **Step 2: Typecheck and lint**

```bash
npx tsc --noEmit && npm run lint
```
Expected: tsc clean; lint reports exactly one warning (`chat-api/api/chat.ts`)

- [ ] **Step 3: Build**

```bash
npm run build
```
Expected: 32 static routes

- [ ] **Step 4: Confirm the default is still dark everywhere**

```bash
grep -c 'class="dark"' out/index.html out/en/index.html out/services/index.html
```
Expected: `1` for each — the shipped default is unchanged.

- [ ] **Step 5: Review both themes in a browser**

```bash
npx serve out -p 4173
```
Visit `/`, `/services/`, `/services/diseno-ux-ui/`, `/en/`, `/en/services/`. Toggle the theme on each. Confirm no invisible text, that the dark bands (Contact, remote-support banner, footer) stay dark in light mode, and that the 404 at `/nope/` stays dark.

- [ ] **Step 6: Commit any fixes from the browser pass**

```bash
git add -A
git commit -m "fix(theme): correct contrast issues found in browser review"
```

If nothing needed fixing, skip this commit.
