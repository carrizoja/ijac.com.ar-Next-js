import type { Locale } from "./routing";

export interface StructuredDataContent {
  organizationDescription: string;
  localBusinessDescription: string;
  serviceType: string;
  offerDescription: string;
}

export const structuredDataContent: Record<Locale, StructuredDataContent> = {
  es: {
    organizationDescription:
      "Soluciones informáticas profesionales, desarrollo web y consultoría IT a nivel global con sede en Buenos Aires",
    localBusinessDescription:
      "Soluciones informáticas profesionales en Buenos Aires con alcance global",
    serviceType: "Soluciones Informáticas",
    offerDescription:
      "Desarrollo web, Apps, WebApps, sistemas empresariales, consultoría IT, soporte técnico pc mac, ciberseguridad y data science",
  },
  en: {
    organizationDescription:
      "Professional IT solutions, web development and global IT consulting, based in Buenos Aires",
    localBusinessDescription:
      "Professional IT solutions in Buenos Aires with global reach",
    serviceType: "IT Solutions",
    offerDescription:
      "Web development, apps, web apps, enterprise systems, IT consulting, PC and Mac technical support, cybersecurity and data science",
  },
};
