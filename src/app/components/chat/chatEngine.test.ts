import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getChatResponse,
  normalizeChatInput,
  type ConversationContext,
} from "./chatEngine";

describe("normalizeChatInput", () => {
  it("normalizes composed accents, case, punctuation, and whitespace", () => {
    expect(normalizeChatInput("  ¿CUÁL es la Ubicación? ")).toBe(
      "cual es la ubicacion",
    );
  });

  it("normalizes decomposed Spanish accents with ES2017-compatible ranges", () => {
    expect(normalizeChatInput("COTIZACIO\u0301N, disen\u0303o y reparacio\u0301n")).toBe(
      "cotizacion diseno y reparacion",
    );
  });
});

describe("getChatResponse", () => {
  afterEach(() => {
    vi.doUnmock("../../../data/services");
    vi.resetModules();
  });

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

  it.each([
    ["Quiero hablar con alguien", "contact"],
    ["¿Cuál es el horario de atención?", "hours"],
    ["¿Dónde están ubicados?", "location"],
    ["Quiero una cotización", "quote"],
    ["¿Qué servicios de ciberseguridad ofrecen?", "cybersecurity"],
  ])(
    "reclassifies %s instead of consuming it in an active flow",
    (input, intent) => {
      const result = getChatResponse(input, {
        flow: "support",
        step: "issue",
      });

      expect(result.intent).toBe(intent);
      expect(result.context).not.toEqual({ flow: "support", step: "issue" });
    },
  );

  it("starts support when it clearly interrupts an active quote flow", () => {
    const result = getChatResponse("Necesito soporte", {
      flow: "quote",
      step: "timing",
    });

    expect(result.intent).toBe("support");
    expect(result.context).toEqual({ flow: "support", step: "area" });
  });

  it("keeps ordinary flow answers concise and in context", () => {
    const result = getChatResponse("Un sitio web", {
      flow: "quote",
      step: "need",
    });

    expect(result.intent).toBe("quote");
    expect(result.context).toEqual({ flow: "quote", step: "timing" });
  });

  it("returns a safe fallback when configured service data is missing", async () => {
    vi.resetModules();
    vi.doMock("../../../data/services", () => ({ services: [] }));
    const { getChatResponse: getResponseWithoutServices } = await import(
      "./chatEngine"
    );

    const result = getResponseWithoutServices("Necesito soporte para Mac");

    expect(result).toMatchObject({
      intent: "apple_support",
      context: null,
    });
    expect(result.text).toContain("información aprobada");
  });
});
