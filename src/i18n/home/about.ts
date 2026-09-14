import type { Locale } from "../routing";

interface AboutStatsCopy {
  projectsCompleted: string;
  clientSatisfaction: string;
}

export interface AboutContent {
  heading: string;
  subheading: string;
  highlightPrefix: string;
  highlightedName: string;
  highlightSuffix: string;
  followUp: string;
  stats: AboutStatsCopy;
  missionTitle: string;
  missionBody: string;
  innovationTitle: string;
  innovationSubtitle: string;
}

export const aboutContent: Record<Locale, AboutContent> = {
  es: {
    heading: "Expertos en Transformación Digital",
    subheading: "Somos una empresa líder en desarrollo web y soporte técnico en Argentina",
    highlightPrefix: "En ",
    highlightedName: "iJac IT Solutions",
    highlightSuffix:
      ", somos una empresa de software en Argentina con sede en Almagro, Buenos Aires,especializada en brindar soluciones informáticas que impulsen el crecimiento de tu negocio.",
    followUp:
      "Nuestro equipo de especialistas trabaja para ofrecer servicios integrales, desde el diseño web hasta el soporte técnico en CABA, garantizando una consultoría IT de primer nivel adaptada al mercado argentino y regional.",
    stats: {
      projectsCompleted: "Proyectos Completados",
      clientSatisfaction: "Satisfacción del Cliente",
    },
    missionTitle: "Nuestra Misión",
    missionBody:
      "Democratizar el acceso a la ingeniería de software en Argentina para que pymes, emprendedores y particulares cuenten con herramientas tecnológicas competitivas, seguras y de alta calidad.",
    innovationTitle: "Innovación Constante",
    innovationSubtitle: "Siempre a la vanguardia tecnológica",
  },
  en: {
    heading: "Experts in Digital Transformation",
    subheading: "We are a leading web development and technical support company in Argentina",
    highlightPrefix: "At ",
    highlightedName: "iJac IT Solutions",
    highlightSuffix:
      ", we are a software company in Argentina based in Almagro, Buenos Aires, specialized in delivering IT solutions that drive your business growth.",
    followUp:
      "Our team of specialists works to deliver comprehensive services, from web design to technical support in CABA, ensuring first-class IT consulting tailored to the Argentine and regional market.",
    stats: {
      projectsCompleted: "Completed Projects",
      clientSatisfaction: "Client Satisfaction",
    },
    missionTitle: "Our Mission",
    missionBody:
      "Democratize access to software engineering in Argentina so that SMEs, entrepreneurs, and individuals have competitive, secure, and high-quality technology tools.",
    innovationTitle: "Constant Innovation",
    innovationSubtitle: "Always at the technological forefront",
  },
};
