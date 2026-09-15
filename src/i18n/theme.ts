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
