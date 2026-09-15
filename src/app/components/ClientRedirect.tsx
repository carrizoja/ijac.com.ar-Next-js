'use client'

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import {
  getHomeSectionHref,
  getLocaleFromPath,
  getLocaleHref,
  localizePath,
  stripLocalePrefix,
  type HomeSection,
  type Locale,
} from '@/i18n/routing';

/**
 * Legacy paths inherited from the WordPress site, keyed by their
 * locale-neutral form. The English site is reached under /en, so a stale
 * link like /en/servicios has to land on /en/services rather than dropping
 * the visitor onto the Spanish site.
 */
const pageRedirects: Record<string, string> = {
  '/servicios': '/services',
  '/contacto': '/contact',
  '/faq': '/contact',
  '/home': '/',
  '/index': '/',
  '/main': '/',
  '/inicio': '/',
};

/** Legacy paths that now live as sections of the home page. */
const sectionRedirects: Record<string, HomeSection> = {
  '/about': 'about',
  '/nosotros': 'about',
  '/testimonials': 'testimonials',
  '/testimonios': 'testimonials',
};

function resolveTarget(path: string, locale: Locale): string | undefined {
  const section = sectionRedirects[path];
  if (section) return getHomeSectionHref(section, locale);

  const page = pageRedirects[path];
  if (!page) return undefined;

  return page === '/' ? localizePath('/', locale) : getLocaleHref(page, locale);
}

export function ClientRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const locale = getLocaleFromPath(pathname);
    const home = localizePath('/', locale);
    const normalized = stripLocalePrefix(pathname.toLowerCase());
    const withoutSlash = normalized.replace(/\/$/, '') || '/';

    const target = resolveTarget(normalized, locale) ?? resolveTarget(withoutSlash, locale);
    if (target) {
      router.replace(target);
      return;
    }

    // Old URLs that carried a file extension.
    if (withoutSlash.endsWith('.html')) {
      router.replace(resolveTarget(withoutSlash.replace('.html', ''), locale) ?? home);
      return;
    }

    if (withoutSlash.endsWith('.php')) {
      router.replace(home);
      return;
    }

    // WordPress and admin leftovers.
    if (
      withoutSlash.includes('/wp-') ||
      withoutSlash.includes('/wordpress') ||
      withoutSlash.includes('/admin')
    ) {
      router.replace(home);
    }
  }, [pathname, router]);

  return null; // This component doesn't render anything
}

export default ClientRedirect;
