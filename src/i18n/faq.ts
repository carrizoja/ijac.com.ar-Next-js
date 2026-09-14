import { business } from "@/data/business";

import type { Locale } from "./routing";

export type FaqAnswer = string | (() => string);

export interface FaqItem {
  question: string;
  answer: FaqAnswer;
}

export interface FaqContent {
  heading: string;
  items: FaqItem[];
}

/**
 * English rendering of business.hours.display ("Lunes a viernes de 9:00 a
 * 18:00"). Shared by the FAQ hours answer and the English contact page's
 * hours card so both surfaces stay in sync without printing Spanish text.
 */
export const businessHoursDisplayEn = "Monday to Friday, 9:00 AM to 6:00 PM";

export const faqContent: Record<Locale, FaqContent> = {
  es: {
    heading: "Preguntas Frecuentes",
    items: [
      {
        question: "¿Qué servicios de IT ofrece iJac?",
        answer:
          "iJac IT Solutions ofrece servicios completos de consultoría IT, soporte técnico de pc y mac, asistencias remotas, desarrollo web, webApps, aplicaciones móviles, gestión de infraestructura y soluciones tecnológicas personalizadas para empresas en Argentina y a nivel global.",
      },
      {
        question: "¿Cualquier tipo de empresa puede contactar a iJac?",
        answer:
          "Sí, trabajamos con empresas de todos los tamaños, desde startups hasta grandes corporaciones o, también, emprendedores o particulares adaptando nuestras soluciones tecnológicas a las necesidades específicas de cada cliente.",
      },
      {
        question: "¿Cuál es el horario de atención?",
        answer: () =>
          `Nuestro horario de atención es ${business.hours.display.toLocaleLowerCase("es")} (GMT-3).`,
      },
      {
        question: "¿Cuál es el tiempo de respuesta para consultas?",
        answer: () =>
          `El tiempo de respuesta depende del tipo de consulta. Para coordinar la atención, escribinos a ${business.email} o por WhatsApp al ${business.phoneDisplay}.`,
      },
    ],
  },
  en: {
    heading: "Frequently Asked Questions",
    items: [
      {
        question: "What IT services does iJac offer?",
        answer:
          "iJac IT Solutions offers full IT consulting, PC and Mac technical support, remote assistance, web development, web apps, mobile applications, infrastructure management, and custom technology solutions for companies in Argentina and worldwide.",
      },
      {
        question: "Can any kind of business work with iJac?",
        answer:
          "Yes, we work with companies of every size, from startups to large corporations, as well as entrepreneurs and individuals, tailoring our technology solutions to each client's specific needs.",
      },
      {
        question: "What are your business hours?",
        answer: () => `Our business hours are ${businessHoursDisplayEn} (GMT-3).`,
      },
      {
        question: "What is the response time for inquiries?",
        answer: () =>
          `Response time depends on the type of inquiry. To coordinate support, write to us at ${business.email} or via WhatsApp at ${business.phoneDisplay}.`,
      },
    ],
  },
};

export function resolveFaqAnswer(answer: FaqAnswer): string {
  return typeof answer === "function" ? answer() : answer;
}
