import type { Locale } from "../routing";

interface FooterContent {
  copyright: (year: number) => string;
  poweredBy: string;
  portfolioTitle: string;
  instagramTitle: string;
  facebookTitle: string;
  servicesHeading: string;
  contactHeading: string;
  locationLabel: string;
  hoursLabel: string;
  cookieSettingsLabel: string;
}

export const footerContent: Record<Locale, FooterContent> = {
  es: {
    copyright: (year) => `© ${year} iJac. Todos los derechos reservados.`,
    poweredBy: "Powered by",
    portfolioTitle: "Visitar portafolio de José Carrizo",
    instagramTitle: "Seguinos en Instagram",
    facebookTitle: "Seguinos en Facebook",
    servicesHeading: "Servicios en Almagro y CABA",
    contactHeading: "Contacto y Ubicación",
    locationLabel: "Colombres 195, Almagro, CABA (C1177)",
    hoursLabel: "Lunes a viernes de 9:00 a 18:00",
    cookieSettingsLabel: "Configurar cookies",
  },
  en: {
    copyright: (year) => `© ${year} iJac. All rights reserved.`,
    poweredBy: "Powered by",
    portfolioTitle: "Visit José Carrizo's portfolio",
    instagramTitle: "Follow us on Instagram",
    facebookTitle: "Follow us on Facebook",
    servicesHeading: "Services in Almagro & Buenos Aires",
    contactHeading: "Contact & Location",
    locationLabel: "Colombres 195, Almagro, CABA (C1177)",
    hoursLabel: "Monday to Friday, 9:00 AM to 6:00 PM",
    cookieSettingsLabel: "Cookie settings",
  },
};
