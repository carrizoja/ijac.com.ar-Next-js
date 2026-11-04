import type { Locale } from "../routing";

export interface ServiceDetailContent {
  faqHeading: string;
}

export const serviceDetailContent: Record<Locale, ServiceDetailContent> = {
  es: { faqHeading: "Preguntas frecuentes" },
  en: { faqHeading: "Frequently asked questions" },
};
