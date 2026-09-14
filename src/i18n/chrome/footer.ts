import type { Locale } from "../routing";

interface FooterContent {
  copyright: (year: number) => string;
  poweredBy: string;
  portfolioTitle: string;
  instagramTitle: string;
  facebookTitle: string;
}

export const footerContent: Record<Locale, FooterContent> = {
  es: {
    copyright: (year) => `© ${year} iJac. Todos los derechos reservados.`,
    poweredBy: "Powered by",
    portfolioTitle: "Visitar portafolio de José Carrizo",
    instagramTitle: "Seguinos en Instagram",
    facebookTitle: "Seguinos en Facebook",
  },
  en: {
    copyright: (year) => `© ${year} iJac. All rights reserved.`,
    poweredBy: "Powered by",
    portfolioTitle: "Visit José Carrizo's portfolio",
    instagramTitle: "Follow us on Instagram",
    facebookTitle: "Follow us on Facebook",
  },
};
