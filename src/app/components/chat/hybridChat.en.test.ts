import { describe, expect, it, vi } from "vitest";
import { resolveChatTurn } from "./hybridChat";
import type { ChatApiClient } from "./chatApi";

function stubClient(): ChatApiClient & { ask: ReturnType<typeof vi.fn> } {
  const ask = vi.fn(async () => ({
    apiVersion: "v1" as const,
    code: "SUCCESS" as const,
    supported: true as const,
    answer: "iJAC provides managed IT support.",
    language: "en" as const,
    sources: [],
  }));
  return { ask } as unknown as ChatApiClient & { ask: ReturnType<typeof vi.fn> };
}

describe("resolveChatTurn locale threading", () => {
  it("answers a matched English deterministic question without calling the API", async () => {
    const client = stubClient();
    const turn = await resolveChatTurn("What services do you offer?", null, {
      client,
      language: "en",
    });

    expect(turn.kind).toBe("deterministic");
    expect(turn.intent).toBe("services");
    expect(turn.text).not.toMatch(/[áéíóúñ¿]/i);
    expect(client.ask).not.toHaveBeenCalled();
  });

  it("falls back to Spanish-style deterministic matching for Portuguese, since chatEngine has no Portuguese intents", async () => {
    const turn = await resolveChatTurn("¿Qué servicios ofrecen?", null, {
      client: stubClient(),
      language: "pt",
    });

    expect(turn.kind).toBe("deterministic");
    expect(turn.intent).toBe("services");
  });
});
