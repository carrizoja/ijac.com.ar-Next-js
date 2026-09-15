import { describe, expect, it } from "vitest";
import { getChatResponse, type ConversationContext } from "./chatEngine";

describe("getChatResponse locale threading", () => {
  it("defaults to Spanish when no locale is given", () => {
    const result = getChatResponse("Buenas tardes");

    expect(result.intent).toBe("greeting");
    expect(result.text).toContain("orientarte");
  });

  it.each([
    ["Hello", "greeting"],
    ["I want a quote", "quote"],
    ["I need technical support", "support"],
    ["How do I contact you?", "contact"],
    ["What are your business hours?", "hours"],
    ["Where are you located?", "location"],
    ["What services do you offer?", "services"],
  ])("matches %s as %s in English", (input, intent) => {
    expect(getChatResponse(input, null, "en").intent).toBe(intent);
  });

  it("returns an English safe fallback without unsupported claims", () => {
    const result = getChatResponse("What framework and cloud do you use?", null, "en");

    expect(result.intent).toBe("fallback");
    expect(result.context).toBeNull();
    expect(result.text).toContain("approved information");
    expect(result.text).not.toMatch(/información aprobada/);
  });

  it("completes the English quote flow with a contact handoff", () => {
    const first = getChatResponse("I want a quote", null, "en");
    const second = getChatResponse("A website", first.context, "en");
    const third = getChatResponse("This month", second.context, "en");

    expect(first.intent).toBe("quote");
    expect(second.context).toEqual({ flow: "quote", step: "timing" });
    expect(third.context).toBeNull();
    expect(third.contactHandoff).toBe(true);
    expect(third.text).toContain("WhatsApp");
  });

  it("completes English support triage with a safe contact handoff", () => {
    let context: ConversationContext = null;
    const first = getChatResponse("I need technical support", context, "en");
    context = first.context;
    const second = getChatResponse("It's a PC", context, "en");
    const third = getChatResponse("It won't turn on", second.context, "en");

    expect(second.context).toEqual({ flow: "support", step: "issue" });
    expect(third.context).toBeNull();
    expect(third.contactHandoff).toBe(true);
    expect(third.text).toContain("without risking your data");
  });

  it("allows an active English flow to be cancelled", () => {
    const result = getChatResponse("Never mind", { flow: "quote", step: "timing" }, "en");

    expect(result.intent).toBe("greeting");
    expect(result.context).toBeNull();
  });

  it("reclassifies a clear English question instead of consuming it in an active flow", () => {
    const result = getChatResponse(
      "What are your business hours?",
      { flow: "support", step: "issue" },
      "en",
    );

    expect(result.intent).toBe("hours");
    expect(result.context).not.toEqual({ flow: "support", step: "issue" });
  });

  it("keeps ordinary English flow answers concise and in context", () => {
    const result = getChatResponse("A website", { flow: "quote", step: "need" }, "en");

    expect(result.intent).toBe("quote");
    expect(result.context).toEqual({ flow: "quote", step: "timing" });
  });

  it("lists English service titles for the services intent, with no Spanish leakage", () => {
    const result = getChatResponse("What services do you offer?", null, "en");

    expect(result.text).not.toMatch(/[áéíóúñ¿]/i);
    expect(result.text.toLowerCase()).toContain("cybersecurity");
  });

  it("does not translate the eight service-specific intents: an English service question falls through to fallback", () => {
    const result = getChatResponse(
      "Can you build a custom website for my business?",
      null,
      "en",
    );

    expect(result.intent).toBe("fallback");
    expect(result.intent).not.toBe("web_development");
  });

  it("still matches the eight service-specific intents on Spanish phrasing even when locale is English", () => {
    const result = getChatResponse("¿Reparan MacBook?", null, "en");

    expect(result.intent).toBe("apple_support");
    // Deliberately untranslated: response stays Spanish for these eight intents.
    expect(result.text).toContain("Brindamos diagnóstico");
  });
});
