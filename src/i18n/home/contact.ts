import type { Locale } from "../routing";

export type ContactCardKey = "location" | "instagram" | "whatsapp" | "facebook";

interface ContactCardCopy {
  title: string;
  subInfo: string;
}

export interface ContactContent {
  heading: string;
  intro: string;
  cards: Record<ContactCardKey, ContactCardCopy>;
  cta: string;
}

export const contactContent: Record<Locale, ContactContent> = {
  es: {
    heading: "Contactanos",
    intro:
      "Estamos acá para ayudarte con tus necesidades tecnológicas. No dudes en contactarnos por cualquiera de estos medios.",
    cards: {
      location: { title: "Ubicación", subInfo: "Argentina" },
      instagram: { title: "Instagram", subInfo: "Seguinos en Instagram" },
      whatsapp: { title: "WhatsApp", subInfo: "Escribinos por WhatsApp" },
      facebook: { title: "Facebook", subInfo: "Seguinos en Facebook" },
    },
    cta: "¿Dudas? Mandanos un mail",
  },
  en: {
    heading: "Contact Us",
    intro:
      "We're here to help you with your technology needs. Feel free to reach out through any of these channels.",
    cards: {
      location: { title: "Location", subInfo: "Argentina" },
      instagram: { title: "Instagram", subInfo: "Follow us on Instagram" },
      whatsapp: { title: "WhatsApp", subInfo: "Message us on WhatsApp" },
      facebook: { title: "Facebook", subInfo: "Follow us on Facebook" },
    },
    cta: "Questions? Send us an email",
  },
};
