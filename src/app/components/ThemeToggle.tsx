"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import { getLocaleFromPath } from "@/i18n/routing";
import { themeContent } from "@/i18n/theme";
import {
  getServerThemeSnapshot,
  getThemeSnapshot,
  setTheme,
  subscribeToTheme,
} from "../lib/theme";

interface ThemeToggleProps {
  /** Lets the mobile drawer close itself after a choice. */
  onToggle?: () => void;
}

export function ThemeToggle({ onToggle }: ThemeToggleProps) {
  const pathname = usePathname();
  const copy = themeContent[getLocaleFromPath(pathname)];

  // The navbar and the drawer each mount a toggle at the same time, so the
  // preference cannot live in component state: both read the one store, and
  // the server snapshot stays "dark" to match the shipped class="dark".
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const apply = () => {
    setTheme(theme === "dark" ? "light" : "dark");
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
