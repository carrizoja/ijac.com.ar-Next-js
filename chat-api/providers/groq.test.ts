import { describe, expect, it } from "vitest";
import { APIConnectionError, APIConnectionTimeoutError, APIError } from "groq-sdk";
import { classifyGroqError, createGroqProvider } from "./groq";
import { loadChatApiConfig, type ChatApiConfig } from "../config";
import type { RetrievalMatch } from "../../packages/knowledge/retriever";

const config: ChatApiConfig = (() => {
  const result = loadChatApiConfig({
    GROQ_API_KEY: "gsk-secret-value",
    GROQ_MODEL: "llama-3.3-70b-versatile",
    CHAT_API_ENABLED: "true",
    CHAT_API_ALLOWED_ORIGINS: "https://ijac.com.ar",
    CHAT_API_CLIENT_KEY_SECRET: "hmac-secret-value",
    CHAT_API_CLIENT_QUOTA: "10",
    CHAT_API_GLOBAL_QUOTA: "500",
    CHAT_API_QUOTA_WINDOW_SECONDS: "3600",
    CHAT_API_TIMEOUT_MS: "8000",
    CHAT_API_MAX_BYTES: "2048",
  });
  if (!result.ok) throw new Error("fixture config must load");
  return result.config;
})();

const evidence: RetrievalMatch[] = [{
  score: 8,
  entry: {
    id: "managed-it-support",
    status: "approved",
    owner: "content-owner-alice",
    title: { es: "Soporte IT administrado", en: "Managed IT support", pt: "Suporte de TI gerenciado" },
    claims: ["iJAC provides managed IT support for business technology environments."],
    aliases: { es: ["soporte técnico"], en: ["IT support"], pt: ["suporte técnico"] },
    tags: ["support", "it", "business"],
    url: "https://ijac.com.ar/services",
    version: 7,
    approvedAt: "2026-01-01T00:00:00.000Z",
    reviewedAt: "2026-01-02T00:00:00.000Z",
    reapprovalDueAt: "2099-01-01T00:00:00.000Z",
    validationRules: ["Do not infer pricing, availability, or response times."],
  },
}];

const answer = {
  supported: true,
  answer: "iJAC provides managed IT support.",
  language: "en",
  sources: [{ id: "managed-it-support", title: "Managed IT support" }],
};

function completion(payload: unknown): Response {
  return new Response(
    JSON.stringify({ choices: [{ message: { content: JSON.stringify(payload) } }] }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

function errorResponse(status: number): Response {
  return new Response(JSON.stringify({ error: { message: "upstream" } }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

interface RecordedCall {
  url: string;
  body: Record<string, unknown>;
  rawBody: string;
  authorization: string | null;
}

/** Fake transport: records each request and replays the queued responses in order. */
function transport(...responders: Array<() => Response | Promise<never>>) {
  const calls: RecordedCall[] = [];
  const impl = async (url: unknown, init: { body?: string; headers?: HeadersInit } = {}) => {
    const rawBody = String(init.body ?? "{}");
    calls.push({
      url: String(url),
      body: JSON.parse(rawBody),
      rawBody,
      authorization: new Headers(init.headers).get("authorization"),
    });
    const responder = responders[Math.min(calls.length - 1, responders.length - 1)];
    return responder();
  };
  return { impl: impl as unknown as typeof fetch, calls };
}

const ask = () => ({ question: "What services do you offer?", language: "en" as const, evidence });

describe("groq provider request", () => {
  it("returns the provider output for downstream validation", async () => {
    const { impl } = transport(() => completion(answer));
    const result = await createGroqProvider(config, { fetch: impl }).complete(ask());

    expect(result).toEqual({ ok: true, output: answer });
  });

  it("uses the model configured by environment", async () => {
    const { impl, calls } = transport(() => completion(answer));
    await createGroqProvider(config, { fetch: impl }).complete(ask());

    expect(calls[0].body.model).toBe("llama-3.3-70b-versatile");
  });

  it("requests structured output so the reply cannot be free prose", async () => {
    const { impl, calls } = transport(() => completion(answer));
    await createGroqProvider(config, { fetch: impl }).complete(ask());

    expect(calls[0].body.response_format).toMatchObject({ type: "json_schema" });
  });

  it("sends the question and the approved claims", async () => {
    const { impl, calls } = transport(() => completion(answer));
    await createGroqProvider(config, { fetch: impl }).complete(ask());

    expect(calls[0].rawBody).toContain("What services do you offer?");
    expect(calls[0].rawBody).toContain("iJAC provides managed IT support for business");
  });

  it("never places the API key in the request body", async () => {
    const { impl, calls } = transport(() => completion(answer));
    await createGroqProvider(config, { fetch: impl }).complete(ask());

    expect(calls[0].rawBody).not.toContain("gsk-secret-value");
    expect(calls[0].rawBody).not.toContain("hmac-secret-value");
    expect(calls[0].authorization).toContain("gsk-secret-value");
  });

  it.each(["content-owner-alice", "2099-01-01", "reapprovalDueAt", "aliases"])(
    "does not leak governance metadata %s to the provider",
    async (leak) => {
      const { impl, calls } = transport(() => completion(answer));
      await createGroqProvider(config, { fetch: impl }).complete(ask());

      expect(calls[0].rawBody).not.toContain(leak);
    },
  );

  it.each(["transcript", "history", "messages_history", "attachments"])(
    "sends no %s field",
    async (field) => {
      const { impl, calls } = transport(() => completion(answer));
      await createGroqProvider(config, { fetch: impl }).complete(ask());

      expect(Object.keys(calls[0].body)).not.toContain(field);
    },
  );

  it("does not stream", async () => {
    const { impl, calls } = transport(() => completion(answer));
    await createGroqProvider(config, { fetch: impl }).complete(ask());

    expect(calls[0].body.stream).not.toBe(true);
  });
});

describe("groq provider retry budget", () => {
  it("retries an eligible 5xx exactly once and then succeeds", async () => {
    const { impl, calls } = transport(() => errorResponse(503), () => completion(answer));
    const result = await createGroqProvider(config, { fetch: impl }).complete(ask());

    expect(calls).toHaveLength(2);
    expect(result).toMatchObject({ ok: true });
  });

  it("gives up after a single retry when the 5xx persists", async () => {
    const { impl, calls } = transport(() => errorResponse(500));
    const result = await createGroqProvider(config, { fetch: impl }).complete(ask());

    expect(calls).toHaveLength(2);
    expect(result).toMatchObject({ ok: false, classification: { category: "provider_unavailable" } });
  });

  it.each([
    [429, "rate_limited"],
    [404, "provider_unavailable"],
    [400, "provider_unavailable"],
  ])("never retries status %i", async (status, category) => {
    const { impl, calls } = transport(() => errorResponse(status));
    const result = await createGroqProvider(config, { fetch: impl }).complete(ask());

    expect(calls).toHaveLength(1);
    expect(result).toMatchObject({ ok: false, classification: { category } });
  });

  it("keeps the SDK's own retry layer disabled so the budget stays authoritative", async () => {
    // groq-sdk defaults to maxRetries: 2, which would make a 500 cost three calls before ours.
    const { impl, calls } = transport(() => errorResponse(500));
    await createGroqProvider(config, { fetch: impl }).complete(ask());

    expect(calls.length).toBeLessThanOrEqual(2);
  });

  it("returns a failure instead of throwing when the connection drops", async () => {
    const { impl } = transport(() => Promise.reject(new Error("ECONNREFUSED 10.0.0.5:443")));
    const result = await createGroqProvider(config, { fetch: impl }).complete(ask());

    expect(result).toMatchObject({ ok: false });
    expect(JSON.stringify(result)).not.toContain("10.0.0.5");
  });

  it("reports malformed provider JSON as invalid output without throwing", async () => {
    const { impl } = transport(() =>
      new Response(JSON.stringify({ choices: [{ message: { content: "{not json" } }] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const result = await createGroqProvider(config, { fetch: impl }).complete(ask());

    expect(result).toMatchObject({ ok: false, classification: { category: "invalid_output" } });
  });
});

describe("groq error classification", () => {
  it("maps a timeout to the timeout failure kind", () => {
    expect(classifyGroqError(new APIConnectionTimeoutError({ message: "timed out" }))).toEqual({
      kind: "timeout",
    });
  });

  it("maps a connection error to the connection failure kind", () => {
    expect(classifyGroqError(new APIConnectionError({ message: "failed" }))).toEqual({
      kind: "connection",
    });
  });

  it("preserves the HTTP status from an API error", () => {
    const error = new APIError(503, undefined, "unavailable", undefined);
    expect(classifyGroqError(error)).toEqual({ kind: "status", status: 503 });
  });

  it("treats an unrecognized throwable as a connection failure rather than guessing", () => {
    expect(classifyGroqError(new Error("something else"))).toEqual({ kind: "connection" });
  });
});
