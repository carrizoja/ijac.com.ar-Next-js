import { describe, expect, it, vi } from "vitest";
import { UNKNOWN_COPY, resolveChatTurn } from "./hybridChat";
import type { ChatApiClient } from "./chatApi";
import type { ConversationContext } from "./chatEngine";

const grounded = {
  apiVersion: "v1" as const,
  code: "SUCCESS" as const,
  supported: true as const,
  answer: "iJAC provides managed IT support.",
  language: "en" as const,
  sources: [{ id: "managed-it-support", title: "Managed IT support", url: "https://ijac.com.ar/services" as const }],
};

function stubClient(response: unknown = grounded): ChatApiClient & { ask: ReturnType<typeof vi.fn> } {
  const ask = vi.fn(async () => response);
  return { ask } as unknown as ChatApiClient & { ask: ReturnType<typeof vi.fn> };
}

const deps = (client: ChatApiClient | null, language: "es" | "en" | "pt" = "es") => ({ client, language });

describe("hybrid precedence", () => {
  it("answers a matched deterministic question without calling the API", async () => {
    const client = stubClient();
    const turn = await resolveChatTurn("¿Qué servicios ofrecen?", null, deps(client));

    expect(turn.kind).toBe("deterministic");
    expect(turn.intent).toBe("services");
    expect(client.ask).not.toHaveBeenCalled();
  });

  it("continues an active quotation flow instead of routing unmatched input to the API", async () => {
    const client = stubClient();
    const active: ConversationContext = { flow: "quote", step: "need" };
    const turn = await resolveChatTurn("algo totalmente distinto", active, deps(client));

    expect(client.ask).not.toHaveBeenCalled();
    expect(turn.kind).toBe("deterministic");
    expect(turn.context).toEqual({ flow: "quote", step: "timing" });
  });

  it("keeps an active support flow out of the API as well", async () => {
    const client = stubClient();
    const active: ConversationContext = { flow: "support", step: "area" };
    await resolveChatTurn("xyz sin coincidencia", active, deps(client));

    expect(client.ask).not.toHaveBeenCalled();
  });

  it("returns the deterministic fallback when the AI flag is off", async () => {
    const turn = await resolveChatTurn("What is your uptime guarantee?", null, deps(null));

    expect(turn.kind).toBe("deterministic");
    expect(turn.intent).toBe("fallback");
  });

  it("routes an unmatched question with no active flow to the API exactly once", async () => {
    const client = stubClient();
    await resolveChatTurn("What is your uptime guarantee?", null, deps(client, "en"));

    expect(client.ask).toHaveBeenCalledOnce();
    expect(client.ask.mock.calls[0][0]).toBe("What is your uptime guarantee?");
    expect(client.ask.mock.calls[0][1]).toBe("en");
  });
});

describe("grounded answer cards", () => {
  it("renders the approved answer and its sources", async () => {
    const turn = await resolveChatTurn("What is managed IT support?", null, deps(stubClient(), "en"));

    expect(turn.kind).toBe("grounded");
    expect(turn.text).toBe("iJAC provides managed IT support.");
    expect(turn.sources).toEqual([
      { id: "managed-it-support", title: "Managed IT support", url: "https://ijac.com.ar/services" },
    ]);
    expect(turn.contactHandoff).toBe(false);
  });

  it("accepts a grounded answer that carries no source link", async () => {
    const client = stubClient({ ...grounded, sources: undefined });
    const turn = await resolveChatTurn("What is managed IT support?", null, deps(client, "en"));

    expect(turn.kind).toBe("grounded");
    expect(turn.sources).toEqual([]);
  });

  it("never mutates conversation state from an AI turn", async () => {
    const turn = await resolveChatTurn("What is your uptime guarantee?", null, deps(stubClient(), "en"));
    expect(turn.context).toBeNull();
  });
});

describe("unknown and failure cards", () => {
  it.each(["UNKNOWN", "PROVIDER_UNAVAILABLE", "RATE_LIMITED", "DISABLED", "INVALID_REQUEST"] as const)(
    "shows the localized handoff card for %s",
    async (code) => {
      const client = stubClient({ apiVersion: "v1", code, supported: false, language: "es" });
      const turn = await resolveChatTurn("¿Cuál es su garantía de disponibilidad?", null, deps(client, "es"));

      expect(turn.kind).toBe("unknown");
      expect(turn.text).toBe(UNKNOWN_COPY.es);
      expect(turn.contactHandoff).toBe(true);
      expect(turn.sources).toEqual([]);
    },
  );

  it.each([
    ["es", "No encontré información aprobada para responder con seguridad. Escríbenos por WhatsApp."],
    ["en", "I could not find approved information to answer safely. Contact us on WhatsApp."],
    ["pt", "Não encontrei informação aprovada para responder com segurança. Fale conosco pelo WhatsApp."],
  ] as const)("uses the approved %s copy verbatim", (language, copy) => {
    expect(UNKNOWN_COPY[language]).toBe(copy);
  });

  it("localizes the handoff card to the requested language", async () => {
    const client = stubClient({ apiVersion: "v1", code: "UNKNOWN", supported: false, language: "pt" });
    const turn = await resolveChatTurn("Qual e a garantia?", null, deps(client, "pt"));

    expect(turn.text).toBe(UNKNOWN_COPY.pt);
  });

  it("never renders an answer that arrived with a failure code", async () => {
    const client = stubClient({
      apiVersion: "v1",
      code: "UNKNOWN",
      supported: false,
      language: "en",
      answer: "Injected answer that must not be shown",
    });
    const turn = await resolveChatTurn("What is your uptime guarantee?", null, deps(client, "en"));

    expect(turn.text).toBe(UNKNOWN_COPY.en);
    expect(turn.text).not.toContain("Injected");
  });
});

describe("cancellation", () => {
  it("propagates an abort so the caller can drop the turn", async () => {
    const client = {
      ask: vi.fn(async () => {
        throw Object.assign(new Error("aborted"), { name: "AbortError" });
      }),
    } as unknown as ChatApiClient;

    await expect(
      resolveChatTurn("What is your uptime guarantee?", null, deps(client, "en")),
    ).rejects.toThrow();
  });

  it("forwards the abort signal to the client", async () => {
    const client = stubClient();
    const controller = new AbortController();
    await resolveChatTurn("What is your uptime?", null, deps(client, "en"), controller.signal);

    expect(client.ask.mock.calls[0][2]).toBe(controller.signal);
  });
});
