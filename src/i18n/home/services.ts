import type { Locale } from "../routing";
import { getServiceCopyForLocale } from "../services/catalog";

export type FeaturedServiceSlug =
  | "ciberseguridad-proteccion-datos"
  | "desarrollo-web-apps"
  | "soporte-tecnico-pc-mac-apple"
  | "redes-wifi-cableado";

interface ServiceCardCopy {
  title: string;
  desc: string;
  alt: string;
}

interface ServicesContent {
  heading: string;
  summary: string;
  cta: string;
  cards?: Record<FeaturedServiceSlug, ServiceCardCopy>;
}

const featuredServiceSlugs: FeaturedServiceSlug[] = [
  "ciberseguridad-proteccion-datos",
  "desarrollo-web-apps",
  "soporte-tecnico-pc-mac-apple",
  "redes-wifi-cableado",
];

/**
 * Derives the English featured-card copy from the English service catalog
 * (`src/i18n/services/catalog.ts`) instead of duplicating it here, so a
 * service can never read differently on the home page vs. its detail page.
 */
function buildEnglishCards(): Record<FeaturedServiceSlug, ServiceCardCopy> {
  return Object.fromEntries(
    featuredServiceSlugs.map((slug) => {
      const copy = getServiceCopyForLocale(slug, "en");
      return [slug, { title: copy!.title, desc: copy!.desc, alt: copy!.alt }];
    }),
  ) as Record<FeaturedServiceSlug, ServiceCardCopy>;
}

export const servicesContent: Record<Locale, ServicesContent> = {
  es: {
    heading: "Nuestros Servicios de Tecnología",
    summary: "Descubre nuestros servicios destacados y visita la pagina de servicios para explorar el catalogo completo, con mas soluciones, detalles y alternativas para tu necesidad.",
    cta: "Ver todos los servicios",
  },
  en: {
    heading: "Our Technology Services",
    summary: "Explore our featured services and visit the services page to browse the complete catalog, with more solutions, details, and options for your needs.",
    cta: "View all services",
    cards: buildEnglishCards(),
  },
};
