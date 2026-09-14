import { getEnglishSlug } from "./services/catalog";

export const locales = ["es", "en"] as const;

export type Locale = (typeof locales)[number];

const ENGLISH_PREFIX = /^\/en(?=\/|$)/;
export const availableEnglishPaths = new Set(["/", "/services", "/contact"]);

function splitUrl(value: string) {
  const suffixIndex = value.search(/[?#]/);
  const pathname = suffixIndex === -1 ? value : value.slice(0, suffixIndex);

  return {
    pathname: pathname.startsWith("/") ? pathname : `/${pathname}`,
    suffix: suffixIndex === -1 ? "" : value.slice(suffixIndex),
  };
}

export function getLocaleFromPath(value: string): Locale {
  return ENGLISH_PREFIX.test(splitUrl(value).pathname) ? "en" : "es";
}

export function stripLocalePrefix(value: string): string {
  const { pathname, suffix } = splitUrl(value);
  const strippedPath = pathname.replace(ENGLISH_PREFIX, "") || "/";

  return `${strippedPath}${suffix}`;
}

export function localizePath(value: string, locale: Locale): string {
  const unprefixed = stripLocalePrefix(value);

  if (locale === "es") return unprefixed;

  const { pathname, suffix } = splitUrl(unprefixed);
  return `${pathname === "/" ? "/en" : `/en${pathname}`}${suffix}`;
}

export function getLocaleHref(value: string, locale: Locale): string {
  if (locale === "es") return localizePath(value, locale);

  const unprefixed = stripLocalePrefix(value);
  const { pathname, suffix } = splitUrl(unprefixed);

  return availableEnglishPaths.has(pathname)
    ? localizePath(unprefixed, locale)
    : `/en${suffix}`;
}

export function getServiceDetailHref(slug: string, locale: Locale): string {
  if (locale === "en") {
    const englishSlug = getEnglishSlug(slug);
    if (englishSlug) return `/en/services/${englishSlug}`;
  }

  return `/services/${slug}`;
}

export const homeSections = ["services", "about", "testimonials", "contact"] as const;

export type HomeSection = (typeof homeSections)[number];

const homeSectionIds: Record<Locale, Partial<Record<HomeSection, string>>> = {
  es: {
    services: "servicios",
    about: "nosotros",
    testimonials: "testimonios",
    contact: "contacto",
  },
  en: {
    services: "services",
    about: "about",
    testimonials: "testimonials",
    contact: "contact",
  },
};

export function getHomeSectionId(
  section: HomeSection,
  locale: Locale,
): string | undefined {
  return homeSectionIds[locale][section];
}

export function isHomeSectionAvailable(section: HomeSection, locale: Locale): boolean {
  return getHomeSectionId(section, locale) !== undefined;
}

export function getHomeSectionHref(
  section: HomeSection,
  locale: Locale,
): string | undefined {
  const id = getHomeSectionId(section, locale);
  if (!id) return undefined;

  return `${localizePath("/", locale)}#${id}`;
}

function isPathAvailable(value: string, locale: Locale): boolean {
  if (locale === "es") return true;

  const { pathname } = splitUrl(stripLocalePrefix(value));
  return availableEnglishPaths.has(pathname);
}

/**
 * Resolves a navigation target for a locale, preferring a translated page and
 * degrading to the home-page section anchor while that page is untranslated.
 */
export function getNavHref(
  section: HomeSection,
  path: string,
  locale: Locale,
): string {
  const localeHref = getLocaleHref(path, locale);
  if (isPathAvailable(path, locale)) return localeHref;

  return getHomeSectionHref(section, locale) ?? localeHref;
}
