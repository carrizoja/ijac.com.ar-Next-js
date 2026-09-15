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
