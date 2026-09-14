import { describe, expect, it } from "vitest";

import { business } from "@/data/business";
import { faqContent, resolveFaqAnswer } from "./faq";

describe("faqContent (es)", () => {
  it("keeps the original Spanish questions and answers byte-identical", () => {
    const items = faqContent.es.items.map((item) => ({
      question: item.question,
      answer: resolveFaqAnswer(item.answer),
    }));

    expect(faqContent.es.heading).toBe("Preguntas Frecuentes");
    expect(items).toEqual([
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
        answer: `Nuestro horario de atención es ${business.hours.display.toLocaleLowerCase("es")} (GMT-3).`,
      },
      {
        question: "¿Cuál es el tiempo de respuesta para consultas?",
        answer: `El tiempo de respuesta depende del tipo de consulta. Para coordinar la atención, escribinos a ${business.email} o por WhatsApp al ${business.phoneDisplay}.`,
      },
    ]);
  });
});

describe("faqContent (en)", () => {
  it("provides four English Q&A pairs with no Spanish leakage", () => {
    const items = faqContent.en.items.map((item) => ({
      question: item.question,
      answer: resolveFaqAnswer(item.answer),
    }));

    expect(items).toHaveLength(4);
    for (const item of items) {
      expect(item.question).not.toMatch(/[¿¡]/);
    }
  });

  it("interpolates business data into the hours and response-time answers", () => {
    const items = faqContent.en.items.map((item) => resolveFaqAnswer(item.answer));

    expect(items[2]).toContain("GMT-3");
    expect(items[2]).not.toContain(business.hours.display);
    expect(items[3]).toContain(business.email);
    expect(items[3]).toContain(business.phoneDisplay);
  });
});

describe("resolveFaqAnswer", () => {
  it("returns plain strings unchanged", () => {
    expect(resolveFaqAnswer("plain")).toBe("plain");
  });

  it("invokes function answers", () => {
    expect(resolveFaqAnswer(() => "computed")).toBe("computed");
  });
});
