import type { Locale } from "../routing";

export interface StaffContent {
  headingPart1: string;
  headingPart2: string;
  description: string;
}

export const staffContent: Record<Locale, StaffContent> = {
  es: {
    headingPart1: "Nuestro",
    headingPart2: "Equipo",
    description:
      "Un staff de profesionales especializados y comprometidos con la excelencia y la innovación tecnológica para hacer realidad tus proyectos.",
  },
  en: {
    headingPart1: "Our",
    headingPart2: "Team",
    description:
      "A team of specialized professionals committed to excellence and technological innovation to bring your projects to life.",
  },
};
