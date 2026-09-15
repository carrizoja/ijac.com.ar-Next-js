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
        className={`group inline-flex min-h-11 items-center px-1 text-sm font-semibold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900 ${
          isCurrent
            ? "text-gray-900 dark:text-white"
            : "text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        }`}
      >
        {/* The label sits in its own positioning context so the underline hugs
            the glyphs while the anchor keeps a 44px touch target. */}
        <span className="relative">
          {text}
          <span
            aria-hidden="true"
            className={`absolute -bottom-1 left-0 h-0.5 w-full origin-center bg-green-500 transition-transform duration-300 ease-out ${
              isCurrent ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            }`}
          />
        </span>
      </a>
    );
  };

  return (
    <div role="group" aria-label={copy.group} className="flex items-center gap-2">
      {link("es", "ES", currentLocale === "es" ? copy.current : copy.alternate)}
      <span
        aria-hidden="true"
        className="h-[3px] w-[3px] shrink-0 rounded-full bg-gray-400 dark:bg-neutral-700"
      />
      {link("en", "EN", currentLocale === "en" ? copy.current : copy.alternate)}
    </div>
  );
}
