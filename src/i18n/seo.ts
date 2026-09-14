import type { Metadata } from "next";

import {
  availableEnglishPaths,
  getServiceDetailHref,
  localizePath,
  type Locale,
} from "./routing";
import { getEnglishSlug } from "./services/catalog";

const BASE_URL = "https://ijac.com.ar";
const SERVICE_DETAIL_PATTERN = /^\/services\/(.+)$/;

function absoluteUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

/** Extracts the canonical (Spanish) slug from a `/services/<slug>` path, if any. */
function serviceSlugFromPath(canonicalPath: string): string | undefined {
  return canonicalPath.match(SERVICE_DETAIL_PATTERN)?.[1];
}

/**
 * Reports whether an English page actually exists for a canonical Spanish
 * path. Pointing hreflang at a URL that 404s is worse than omitting it, so
 * callers must gate the `en` alternate on this.
 */
function hasEnglishAlternate(canonicalPath: string): boolean {
  const slugEs = serviceSlugFromPath(canonicalPath);
  if (slugEs) return Boolean(getEnglishSlug(slugEs));

  return availableEnglishPaths.has(canonicalPath);
}

/** Resolves the locale-specific path for a canonical Spanish path, translating service slugs. */
function resolvePath(canonicalPath: string, locale: Locale): string {
  const slugEs = serviceSlugFromPath(canonicalPath);
  if (slugEs) return getServiceDetailHref(slugEs, locale);

  return localizePath(canonicalPath, locale);
}

/**
 * Builds the `alternates` metadata block for a page, given its canonical
 * (Spanish) path and the locale it is rendered in: the correct `canonical`
 * for that locale, plus `languages` (es/en/x-default, x-default pointing at
 * the Spanish URL) when — and only when — an English counterpart exists.
 */
export function getSeoAlternates(
  canonicalPath: string,
  locale: Locale,
): NonNullable<Metadata["alternates"]> {
  const alternates: NonNullable<Metadata["alternates"]> = {
    canonical: absoluteUrl(resolvePath(canonicalPath, locale)),
  };

  if (hasEnglishAlternate(canonicalPath)) {
    const esUrl = absoluteUrl(canonicalPath);
    alternates.languages = {
      es: esUrl,
      en: absoluteUrl(resolvePath(canonicalPath, "en")),
      "x-default": esUrl,
    };
  }

  return alternates;
}
