import { describe, expect, it, vi } from "vitest";
import { createChatApiClient } from "./chatApi";

const success = {
  apiVersion: "v1",
  code: "SUCCESS",
  supported: true,
  answer: "iJAC provides managed IT support.",
  language: "en",
  sources: [{ id: "managed-it-support", title: "Managed IT support", url: "https://ijac.com.ar/services" }],
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function client(fetchImpl: typeof fetch) {
  return createChatApiClient("https://api.ijac.com.ar", fetchImpl);
}

describe("chat API client request", () => {
  it("posts the one-question contract to the versioned endpoint", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(success));
    await client(fetchImpl as unknown as typeof fetch).ask("What services?", "en");

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.ijac.com.ar/v1/chat");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({
      apiVersion: "v1",
      question: "What services?",
      language: "en",
    });
  });

  it("sends no transcript, history, or streaming field", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(success));
    await client(fetchImpl as unknown as typeof fetch).ask("What services?", "es");

    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    const keys = Object.keys(JSON.parse(String(init.body)));
    for (const forbidden of ["transcript", "history", "stream", "attachments", "messages"]) {
      expect(keys).not.toContain(forbidden);
    }
  });

  it("returns the parsed success response", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(success));
    const result = await client(fetchImpl as unknown as typeof fetch).ask("What services?", "en");

    expect(result).toEqual(success);
  });
});

describe("chat API client failure handling", () => {
  it.each([429, 503, 400])("maps HTTP %i carrying a contract body to that body", async (status) => {
    const body = { apiVersion: "v1", code: status === 429 ? "RATE_LIMITED" : "PROVIDER_UNAVAILABLE", supported: false, language: "en" };
    const fetchImpl = vi.fn(async () => jsonResponse(body, status));
    const result = await client(fetchImpl as unknown as typeof fetch).ask("q", "en");

    expect(result.supported).toBe(false);
    expect(result.apiVersion).toBe("v1");
  });

  it("falls back to a localized UNKNOWN when the body is not contract-valid", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ nonsense: true }));
    const result = await client(fetchImpl as unknown as typeof fetch).ask("q", "pt");

    expect(result).toEqual({ apiVersion: "v1", code: "UNKNOWN", supported: false, language: "pt" });
  });

  it("falls back to UNKNOWN when the response is not JSON at all", async () => {
    const fetchImpl = vi.fn(async () => new Response("<html>gateway</html>", { status: 502 }));
    const result = await client(fetchImpl as unknown as typeof fetch).ask("q", "es");

    expect(result).toMatchObject({ code: "UNKNOWN", supported: false, language: "es" });
  });

  it("falls back to UNKNOWN when the network rejects, without leaking the cause", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("ECONNREFUSED 10.0.0.5:443");
    });
    const result = await client(fetchImpl as unknown as typeof fetch).ask("q", "en");

    expect(result).toMatchObject({ code: "UNKNOWN", supported: false });
    expect(JSON.stringify(result)).not.toContain("10.0.0.5");
  });

  it("never returns an answer alongside a failure code", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ nonsense: true }));
    const result = await client(fetchImpl as unknown as typeof fetch).ask("q", "en");

    expect(result).not.toHaveProperty("answer");
    expect(result).not.toHaveProperty("sources");
  });
});

describe("chat API client cancellation", () => {
  it("passes the abort signal through to fetch", async () => {
    const controller = new AbortController();
    const fetchImpl = vi.fn(async () => jsonResponse(success));
    await client(fetchImpl as unknown as typeof fetch).ask("q", "en", controller.signal);

    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.signal).toBe(controller.signal);
  });

  it("rethrows an abort so the caller can drop the turn instead of rendering a card", async () => {
    const controller = new AbortController();
    controller.abort();
    const fetchImpl = vi.fn(async () => {
      throw Object.assign(new Error("aborted"), { name: "AbortError" });
    });

    await expect(
      client(fetchImpl as unknown as typeof fetch).ask("q", "en", controller.signal),
    ).rejects.toThrow();
  });
});
