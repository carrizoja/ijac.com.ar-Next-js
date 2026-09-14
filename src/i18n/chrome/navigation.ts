import { business } from "@/data/business";

import { getNavHref, localizePath, type Locale } from "../routing";

interface NavigationContent {
  logoTitle: string;
  servicesLabel: string;
  aboutLabel: string;
  testimonialsLabel: string;
  contactLabel: string;
  openMenuLabel: string;
  closeMenuLabel: string;
}

export const navigationContent: Record<Locale, NavigationContent> = {
  es: {
    logoTitle: "Ir al inicio",
    servicesLabel: "Servicios",
    aboutLabel: "Nosotros",
    testimonialsLabel: "Testimonios",
    contactLabel: "Contacto",
    openMenuLabel: "Abrir menú de navegación",
    closeMenuLabel: "Cerrar menú de navegación",
  },
  en: {
    logoTitle: "Go to homepage",
    servicesLabel: "Services",
    aboutLabel: "About",
    testimonialsLabel: "Testimonials",
    contactLabel: "Contact",
    openMenuLabel: "Open navigation menu",
    closeMenuLabel: "Close navigation menu",
  },
};

export interface ContactNavLink {
  href: string;
  external: boolean;
}

/**
 * Resolves where the Contact nav item points for a locale. While a locale has
 * no contact page and no contact section, `getNavHref` can only offer that
 * locale's home, which is a dead end — so fall back to the WhatsApp entry
 * point the English Hero CTA already uses. Adding a real contact destination
 * for the locale retires the fallback automatically.
 */
export function getContactNavLink(locale: Locale): ContactNavLink {
  const href = getNavHref("contact", "/contact", locale);

  return href === localizePath("/", locale)
    ? { href: business.whatsappUrl, external: true }
    : { href, external: false };
}
