"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import { getLocaleFromPath, getLocaleHref, type Locale } from "@/i18n/routing";

const labels = {
  es: {
    group: "Selector de idioma",
    current: "Idioma actual: Español",
    alternate: "Ver esta página en inglés",
  },
  en: {
    group: "Language selector",
    current: "Current language: English",
    alternate: "View this page in Spanish",
  },
} as const;

function subscribeToUrlChange(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener("hashchange", onChange);

  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("hashchange", onChange);
  };
}

function getBrowserUrl() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

interface LanguageToggleProps {
  onNavigate?: () => void;
}

export function LanguageToggle({ onNavigate }: LanguageToggleProps) {
  const pathname = usePathname();
  const currentUrl = useSyncExternalStore(
    subscribeToUrlChange,
    getBrowserUrl,
    () => pathname,
  );
  const currentLocale = getLocaleFromPath(pathname);
  const copy = labels[currentLocale];

  const link = (locale: Locale, text: string, accessibleName: string) => {
    const isCurrent = locale === currentLocale;

    return (
      <a
        href={getLocaleHref(currentUrl, locale)}
        hrefLang={locale}
        lang={locale}
        aria-label={accessibleName}
        aria-current={isCurrent ? "page" : undefined}
        onClick={onNavigate}
        className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900 ${
          isCurrent
            ? "bg-cyan-700 text-white"
            : "text-gray-800 hover:bg-gray-200 dark:text-gray-100 dark:hover:bg-neutral-700"
        }`}
      >
        {text}
      </a>
    );
  };

  return (
    <div
      role="group"
      aria-label={copy.group}
      className="flex items-center rounded-lg border border-gray-300 bg-white/70 p-0.5 dark:border-gray-600 dark:bg-neutral-800/70"
    >
      {link("es", "ES", currentLocale === "es" ? copy.current : copy.alternate)}
      <span aria-hidden="true" className="text-gray-500 dark:text-gray-400">
        /
      </span>
      {link("en", "EN", currentLocale === "en" ? copy.current : copy.alternate)}
    </div>
  );
}
