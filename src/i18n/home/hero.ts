import type { Locale } from "../routing";

export interface HeroContent {
  heading: string;
  typewriter: readonly string[];
  cta: string;
}

export const heroContent: Record<Locale, HeroContent> = {
  es: {
    heading: "Soluciones Informáticas y Desarrollo Web",
    typewriter: ["Hacemos", "ingeniería", "para", "un", "mundo", "más", "inteligente."],
    cta: "Contactanos",
  },
  en: {
    heading: "IT Solutions and Web Development",
    typewriter: ["We", "engineer", "a", "smarter", "world."],
    cta: "Contact us",
  },
};
