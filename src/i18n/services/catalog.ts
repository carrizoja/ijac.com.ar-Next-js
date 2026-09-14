import { getServiceBySlug, getServiceSlugs } from "../../data/services.js";
import type { Locale } from "../routing";

export interface ServiceCopy {
  /** Locale-specific slug: the canonical Spanish slug for "es", the English slug for "en". */
  slug: string;
  /** Canonical Spanish slug — the stable identity shared across locales. */
  slugEs: string;
  title: string;
  desc: string;
  seoIntro: string;
  fullDescription: string;
  highlights: string[];
  ctaLabel: string;
  alt: string;
  src: string;
}

interface EnglishServiceCopy {
  slugEn: string;
  title: string;
  desc: string;
  seoIntro: string;
  fullDescription: string;
  highlights: string[];
  ctaLabel: string;
  alt: string;
}

/**
 * English copy for the canonical Spanish catalog in `src/data/services.js`.
 * Keyed by the canonical (Spanish) slug — the only stable identity a service
 * has across locales. `src` (the image URL) is intentionally not duplicated
 * here; it is always read from the Spanish catalog via `getServiceBySlug`.
 *
 * The title/desc/alt for the four services already surfaced on the homepage
 * featured cards (`src/i18n/home/services.ts`) reuse those exact reviewed
 * strings so a service never reads differently on the home page vs. its
 * detail page.
 */
const englishCatalog: Record<string, EnglishServiceCopy> = {
  "ciberseguridad-proteccion-datos": {
    slugEn: "cybersecurity-data-protection",
    title: "Cybersecurity and Data Protection for Businesses",
    desc: "Firewall control, local network monitoring, user administration, malware protection, and security cameras.",
    seoIntro:
      "We strengthen the operational security of small and midsize businesses and work teams with concrete measures to prevent unauthorized access, data loss, and service outages.",
    fullDescription:
      "We design and implement cybersecurity schemes for businesses that need to protect their equipment, local network, and critical business information. We combine firewall configuration, preventive monitoring, user administration, and device hardening to reduce risk without complicating day-to-day operations.",
    highlights: [
      "Configuration and administration of firewalls, antivirus, and anti-malware.",
      "Monitoring of the local network, access, and connected devices.",
      "User and permission management, plus preventive measures to safeguard data.",
    ],
    ctaLabel: "Request a security assessment",
    alt: "Cybersecurity and data protection for businesses in Buenos Aires",
  },
  "armado-pcs-hardware": {
    slugEn: "pc-building-hardware-consulting",
    title: "PC Building and Hardware Consulting",
    desc: "Hardware assembly and configuration, operating system installation, performance optimization, and guidance on component purchases",
    seoIntro:
      "We build custom computers for work, study, design, or gaming, with compatible components and configurations built for real-world performance.",
    fullDescription:
      "We advise on and build custom computers based on budget, intended use, and expected lifespan. We also optimize existing equipment, install operating systems, and help choose reliable components to avoid bottlenecks or unnecessary purchases.",
    highlights: [
      "Component selection based on performance goals and budget.",
      "Assembly, operating system installation, and initial setup.",
      "Optimization and recommendations for future upgrades.",
    ],
    ctaLabel: "Request hardware guidance",
    alt: "PC building and hardware consulting in Buenos Aires",
  },
  "redes-wifi-cableado": {
    slugEn: "wifi-networks-structured-cabling",
    title: "Wi-Fi Networks and Structured Cabling",
    desc: "Wired and wireless networks, router configuration, monitoring, optimization, and connectivity support.",
    seoIntro:
      "We design stable networks for offices, storefronts, and homes that need reliable coverage, speed, and a well-organized infrastructure.",
    fullDescription:
      "We implement Wi-Fi and wired networks focused on stability, coverage, and ease of maintenance. We assess the space, position routers and access points, resolve connectivity issues, and leave a solid foundation to grow without improvisation.",
    highlights: [
      "Structured cabling and wireless network installation.",
      "Configuration of routers, access points, and basic network segmentation.",
      "Coverage optimization and connectivity troubleshooting.",
    ],
    ctaLabel: "Ask about network installation",
    alt: "Wi-Fi network and structured cabling installation in Buenos Aires",
  },
  "soporte-tecnico-pc-mac-apple": {
    slugEn: "technical-support-pc-mac-apple",
    title: "Technical Support for PC, Mac, and Apple",
    desc: "Hardware and software diagnostics, preventive maintenance, configuration, and technical guidance.",
    seoIntro:
      "We provide technical support for Windows and Apple devices, focused on fast diagnostics, maintenance, and operational continuity.",
    fullDescription:
      "We handle hardware and software issues on PCs, laptops, Mac computers, and Apple devices. We perform preventive and corrective maintenance, initial setup, error resolution, and ongoing technical support for individuals, professionals, and small businesses.",
    highlights: [
      "Fault diagnostics on PC, MacBook, iMac, iPhone, and iPad.",
      "Preventive maintenance, cleaning, configuration, and updates.",
      "Resolution of software, performance, and connectivity issues.",
    ],
    ctaLabel: "Request technical support",
    alt: "Technical support for Apple, Mac, and PC devices in Buenos Aires",
  },
  "diseno-ux-ui": {
    slugEn: "ux-ui-design",
    title: "UX/UI Design",
    desc: "User research, wireframe and prototype creation, interface design, and usability testing",
    seoIntro:
      "We design clear, functional, and consistent digital experiences so every product is easy to understand and use.",
    fullDescription:
      "We turn business goals and user needs into intuitive interfaces. We work with research, information architecture, wireframes, prototypes, and validation to reduce friction and improve the experience across sites, systems, and applications.",
    highlights: [
      "User research and definition of key flows.",
      "Wireframes, prototypes, and coherent visual systems.",
      "Usability testing to iterate with sound judgment.",
    ],
    ctaLabel: "Talk about UX/UI design",
    alt: "UX/UI design in Buenos Aires",
  },
  "desarrollo-web-apps": {
    slugEn: "web-app-development",
    title: "Web and Mobile Application Development",
    desc: "Responsive websites, interactive web applications, search optimization, and ongoing maintenance.",
    seoIntro:
      "We build sites and applications designed for performance, scalability, and search visibility from day one of the project.",
    fullDescription:
      "We develop websites, web apps, and mobile products focused on user experience, speed, organic ranking, and maintainability. We can work on anything from a landing page to a custom solution for internal processes, sales, or customer service.",
    highlights: [
      "Responsive development of websites, apps, and internal tools.",
      "Technical SEO optimization and performance improvements.",
      "Ongoing maintenance, adjustments, and new features.",
    ],
    ctaLabel: "Request a digital proposal",
    alt: "Web and mobile application development in Buenos Aires",
  },
  "data-science-inteligencia-artificial": {
    slugEn: "data-science-artificial-intelligence",
    title: "Data Science and Artificial Intelligence (AI)",
    desc: "Data analysis, data visualization, predictive modeling, and implementation of artificial intelligence solutions",
    seoIntro:
      "We turn data into decisions with dashboards, models, and automations aimed at real business problems.",
    fullDescription:
      "We apply data analysis, visualization, predictive modeling, and artificial intelligence to uncover patterns, automate tasks, and improve decisions. The approach is practical: we prioritize measurable, understandable solutions so results can be incorporated into daily work.",
    highlights: [
      "Exploratory analysis and visualization of critical information.",
      "Predictive models and AI-driven process automation.",
      "Implementations driven by metrics and concrete use cases.",
    ],
    ctaLabel: "Explore AI solutions",
    alt: "Data Science and Artificial Intelligence in Buenos Aires",
  },
  "branding-marketing-digital": {
    slugEn: "branding-digital-marketing",
    title: "Branding and Digital Marketing Strategy",
    desc: "Brand identity development, logo design, style guide creation, and brand positioning strategies",
    seoIntro:
      "We define clearer, more memorable brands that are ready to sustain a consistent digital presence.",
    fullDescription:
      "We help build a consistent visual and verbal identity for businesses and professionals who need to communicate their value proposition more effectively. From the logo and style guide to positioning strategy, we make sure every touchpoint reinforces brand perception.",
    highlights: [
      "Visual identity, logo, and brand asset design.",
      "Definition of graphic guidelines and communication tone.",
      "Digital positioning strategies aligned with the business.",
    ],
    ctaLabel: "Boost my brand",
    alt: "Branding and digital marketing strategy in Buenos Aires",
  },
};

/** Resolves the English slug for a canonical Spanish slug, when translated. */
export function getEnglishSlug(slugEs: string): string | undefined {
  return englishCatalog[slugEs]?.slugEn;
}

/** Resolves the canonical Spanish slug for an English slug. */
export function getCanonicalSlug(slugEn: string): string | undefined {
  return Object.entries(englishCatalog).find(([, entry]) => entry.slugEn === slugEn)?.[0];
}

/** Lists the slugs a locale's service routes use, in catalog order. */
export function getServiceSlugsForLocale(locale: Locale): string[] {
  if (locale === "es") return getServiceSlugs();

  return getServiceSlugs()
    .map((slugEs) => getEnglishSlug(slugEs))
    .filter((slugEn): slugEn is string => Boolean(slugEn));
}

/** Resolves the full copy for a service (by its canonical slug) in a locale. */
export function getServiceCopyForLocale(
  slugEs: string,
  locale: Locale,
): ServiceCopy | undefined {
  const source = getServiceBySlug(slugEs);
  if (!source) return undefined;

  if (locale === "es") {
    return {
      slug: source.slug,
      slugEs: source.slug,
      title: source.title,
      desc: source.desc,
      seoIntro: source.seoIntro,
      fullDescription: source.fullDescription,
      highlights: source.highlights,
      ctaLabel: source.ctaLabel,
      alt: source.alt,
      src: source.src,
    };
  }

  const english = englishCatalog[slugEs];
  if (!english) return undefined;

  return {
    slug: english.slugEn,
    slugEs: source.slug,
    title: english.title,
    desc: english.desc,
    seoIntro: english.seoIntro,
    fullDescription: english.fullDescription,
    highlights: english.highlights,
    ctaLabel: english.ctaLabel,
    alt: english.alt,
    src: source.src,
  };
}

/** Resolves a service from a locale-specific slug (English slug for "en", canonical for "es"). */
export function getServiceByLocaleSlug(slug: string, locale: Locale): ServiceCopy | undefined {
  if (locale === "es") return getServiceCopyForLocale(slug, "es");

  const slugEs = getCanonicalSlug(slug);
  if (!slugEs) return undefined;

  return getServiceCopyForLocale(slugEs, "en");
}
