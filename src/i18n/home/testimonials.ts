import type { Locale } from "../routing";

export interface TestimonialsContent {
  heading: string;
  /** Visible label crediting the platform a review came from. */
  sourceLabel: (source: string) => string;
  /** Accessible name for the link out to the original review. */
  reviewLinkLabel: (name: string, source: string) => string;
  /** Accessible name for the star rating. */
  ratingLabel: (rating: number, total: number) => string;
}

export const testimonialsContent: Record<Locale, TestimonialsContent> = {
  es: {
    heading: "Lo que dicen nuestros clientes",
    sourceLabel: (source) => `Reseña de ${source}`,
    reviewLinkLabel: (name, source) =>
      `Ver la reseña de ${name} en ${source} (se abre en una pestaña nueva)`,
    ratingLabel: (rating, total) => `${rating} de ${total} estrellas`,
  },
  en: {
    heading: "What our clients say",
    sourceLabel: (source) => `${source} review`,
    reviewLinkLabel: (name, source) =>
      `View ${name}'s review on ${source} (opens in a new tab)`,
    ratingLabel: (rating, total) => `${rating} out of ${total} stars`,
  },
};
