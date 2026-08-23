import { describe, expect, it } from "vitest";
import {
  getChatResponse,
  normalizeChatInput,
  type ConversationContext,
} from "./chatEngine";

describe("normalizeChatInput", () => {
  it("normalizes accents, case, punctuation, and whitespace", () => {
    expect(normalizeChatInput("  ¿CUÁL es la Ubicación? ")).toBe(
      "cual es la ubicacion",
    );
  });
});

describe("getChatResponse", () => {
  it.each([
    ["¿Reparan MacBook?", "apple_support"],
    ["Necesito mejorar el Wi-Fi y el router", "networking"],
    ["Quiero una PC gamer a medida", "hardware"],
    ["Necesito protección contra malware", "cybersecurity"],
    ["¿Hacen diseño de experiencia de usuario?", "ux_ui"],
    ["Quiero desarrollar una aplicación móvil", "web_development"],
    ["Busco análisis de datos", "data_ai"],
    ["Necesito una identidad visual", "branding"],
    ["Necesito soporte", "support"],
    ["¿Cómo los contacto por teléfono?", "contact"],
    ["¿Cuál es el horario de atención?", "hours"],
    ["¿Dónde están ubicados?", "location"],
    ["¿Qué servicios ofrecen?", "services"],
    ["Buenas tardes", "greeting"],
  ])("matches %s as %s", (input, intent) => {
    expect(getChatResponse(input).intent).toBe(intent);
  });

  it("prioritizes quote qualification over service and Apple terms", () => {
    const result = getChatResponse("¿Cuánto cuesta el servicio para una Mac?");

    expect(result.intent).toBe("quote");
    expect(result.context).toEqual({ flow: "quote", step: "need" });
    expect(result.text).not.toMatch(/\$|ARS|gratis/i);
  });

  it("prioritizes Apple support over broad support and service terms", () => {
    expect(
      getChatResponse("Necesito servicio y soporte técnico para un iPhone").intent,
    ).toBe("apple_support");
  });

  it("does not confuse WhatsApp with mobile app development", () => {
    expect(getChatResponse("¿Tienen WhatsApp?").intent).toBe("contact");
  });

  it("returns a safe fallback without unsupported claims", () => {
    const result = getChatResponse("¿Qué framework y nube usan?");

    expect(result.intent).toBe("fallback");
    expect(result.context).toBeNull();
    expect(result.text).toContain("información aprobada");
  });

  it("completes the quote flow with a contact handoff", () => {
    const first = getChatResponse("Quiero una cotización");
    const second = getChatResponse("Un sitio web", first.context);
    const third = getChatResponse("Durante este mes", second.context);

    expect(second.context).toEqual({ flow: "quote", step: "timing" });
    expect(third.context).toBeNull();
    expect(third.contactHandoff).toBe(true);
    expect(third.text).toContain("WhatsApp");
  });

  it("completes support triage with a safe contact handoff", () => {
    let context: ConversationContext = null;
    const first = getChatResponse("Necesito soporte", context);
    context = first.context;
    const second = getChatResponse("Es una PC", context);
    const third = getChatResponse("No enciende", second.context);

    expect(second.context).toEqual({ flow: "support", step: "issue" });
    expect(third.context).toBeNull();
    expect(third.contactHandoff).toBe(true);
    expect(third.text).toContain("sin arriesgar tus datos");
  });

  it("allows an active flow to be cancelled", () => {
    const result = getChatResponse("Otra consulta", {
      flow: "quote",
      step: "timing",
    });

    expect(result.intent).toBe("greeting");
    expect(result.context).toBeNull();
  });
});
