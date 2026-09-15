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

/** Every mounted toggle subscribes; a write wakes all of them at once. */
const themeListeners = new Set<() => void>();

export function subscribeToTheme(onStoreChange: () => void): () => void {
  themeListeners.add(onStoreChange);

  return () => {
    themeListeners.delete(onStoreChange);
  };
}

/**
 * Storage is the single source of truth, so two toggles mounted at once read
 * the same value and no in-memory copy can drift from it. The value is a
 * string, so repeated reads are referentially stable for useSyncExternalStore.
 */
export function getThemeSnapshot(): Theme {
  return readStoredTheme();
}

/** The document ships class="dark", so the server render has to agree. */
export function getServerThemeSnapshot(): Theme {
  return "dark";
}

/**
 * Persists the preference, applies it to the document, and notifies every
 * subscriber. The class is driven by re-reading the store rather than by the
 * requested value: if the write was rejected there is no preference to honour
 * and the site stays on the dark default instead of drifting out of sync with
 * the control that claims to own it.
 */
export function setTheme(theme: Theme): void {
  storeTheme(theme);

  const applied = getThemeSnapshot();
  document.documentElement.classList.toggle("dark", applied === "dark");

  for (const listener of themeListeners) {
    listener();
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
