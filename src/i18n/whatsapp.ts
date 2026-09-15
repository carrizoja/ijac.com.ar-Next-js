import { business } from "@/data/business";

import type { Locale } from "./routing";

/** wa.me addresses the number without a leading "+" or separators. */
const phoneNumber = business.phoneHref.replace(/\D/g, "");

const openingMessage: Record<Locale, string> = {
  es: "Hola iJAC, me interesa conocer más sobre sus servicios",
  en: "Hi iJAC, I'd like to know more about your services",
};

/**
 * Builds the WhatsApp entry point with an opening message the recipient
 * actually reads. `business.whatsappUrl` carries the Spanish wording, so
 * English visitors sent there would arrive with a Spanish draft already
 * typed for them.
 */
export function getWhatsAppUrl(locale: Locale): string {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    openingMessage[locale],
  )}`;
}
