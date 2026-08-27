import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleChatRequest, type ChatHandlerDeps } from "./chat";
import { loadChatApiConfig, type ChatApiConfig } from "../config";
import { KILL_SWITCH_KEY } from "../controls";
import { chatResponseSchema } from "../../packages/contracts/chat";
import type { RetrievalMatch, RetrievalResult } from "../../packages/knowledge/retriever";
import type { ProviderOutcome } from "../providers/groq";
import { FakeRedis } from "../testing/fakeRedis";

function configWith(overrides: Record<string, string> = {}): ChatApiConfig {
  const result = loadChatApiConfig({
    GROQ_API_KEY: "gsk-secret-value",
    GROQ_MODEL: "llama-3.3-70b-versatile",
    CHAT_API_ENABLED: "true",
    CHAT_API_ALLOWED_ORIGINS: "https://ijac.com.ar",
    CHAT_API_CLIENT_KEY_SECRET: "hmac-secret-value",
    CHAT_API_CLIENT_QUOTA: "3",
    CHAT_API_GLOBAL_QUOTA: "10",
    CHAT_API_QUOTA_WINDOW_SECONDS: "3600",
    CHAT_API_TIMEOUT_MS: "8000",
    CHAT_API_MAX_BYTES: "2048",
    CHAT_API_KV_URL: "https://kv.example.upstash.io",
    CHAT_API_KV_TOKEN: "kv-token-value",
    ...overrides,
  });
  if (!result.ok) throw new Error("fixture config must load");
  return result.config;
}

const evidence: RetrievalMatch[] = [{
  score: 8,
  entry: {
    id: "managed-it-support",
    status: "approved",
    owner: "content-owner",
    title: { es: "Soporte IT administrado", en: "Managed IT support", pt: "Suporte de TI gerenciado" },
    claims: ["iJAC provides managed IT support for business technology environments."],
    aliases: { es: ["soporte técnico"], en: ["IT support"], pt: ["suporte técnico"] },
    tags: ["support", "it", "business"],
    url: "https://ijac.com.ar/services",
    version: 1,
    approvedAt: "2026-01-01T00:00:00.000Z",
    reviewedAt: "2026-01-01T00:00:00.000Z",
    reapprovalDueAt: "2099-01-01T00:00:00.000Z",
  },
}];

const groundedOutput = {
  supported: true,
  answer: "iJAC provides managed IT support.",
  language: "en",
  sources: [{ id: "managed-it-support", title: "Managed IT support" }],
};

const found: RetrievalResult = { matches: evidence, belowThreshold: false, ambiguous: false };
const nothing: RetrievalResult = { matches: [], belowThreshold: true, ambiguous: false };

function request(overrides: Record<string, unknown> = {}) {
  return {
    method: "POST",
    origin: "https://ijac.com.ar",
    contentType: "application/json",
    body: JSON.stringify({ apiVersion: "v1", question: "What services do you offer?", language: "en" }),
    ...overrides,
  };
}

interface Harness {
  deps: ChatHandlerDeps;
  kv: FakeRedis;
  provider: { complete: ReturnType<typeof vi.fn> };
  retrieve: ReturnType<typeof vi.fn>;
}

function harness(options: {
  config?: ChatApiConfig;
  retrieval?: RetrievalResult;
  outcome?: ProviderOutcome;
} = {}): Harness {
  const kv = new FakeRedis();
  const retrieve = vi.fn(() => options.retrieval ?? found);
  const provider = {
    complete: vi.fn(async () => options.outcome ?? ({ ok: true, output: groundedOutput } as ProviderOutcome)),
  };
  return {
    kv,
    provider,
    retrieve,
    deps: {
      config: options.config ?? configWith(),
      kv,
      provider,
      retrieve,
      clientAddress: "203.0.113.7",
    },
  };
}

describe("chat handler precedence", () => {
  let h: Harness;
  beforeEach(() => {
    h = harness();
  });

  it("rejects a disallowed origin before touching the gate, retrieval, or the provider", async () => {
    const response = await handleChatRequest(request({ origin: "https://evil.example" }), h.deps);

    expect(response.status).toBe(403);
    expect(h.kv.keys()).toEqual([]);
    expect(h.retrieve).not.toHaveBeenCalled();
    expect(h.provider.complete).not.toHaveBeenCalled();
  });

  it("stops at the kill switch without retrieving or calling the provider", async () => {
    h.kv.seed(KILL_SWITCH_KEY, "1");
    const response = await handleChatRequest(request(), h.deps);

    expect(response.body).toMatchObject({ code: "DISABLED", supported: false });
    expect(h.retrieve).not.toHaveBeenCalled();
    expect(h.provider.complete).not.toHaveBeenCalled();
  });

  it("stops at an exhausted quota without calling the provider", async () => {
    for (let i = 0; i < 3; i++) await handleChatRequest(request(), h.deps);
    h.provider.complete.mockClear();

    const response = await handleChatRequest(request(), h.deps);

    expect(response.body).toMatchObject({ code: "RATE_LIMITED", supported: false });
    expect(h.provider.complete).not.toHaveBeenCalled();
  });

  it("never calls the provider when retrieval falls below the threshold", async () => {
    const below = harness({ retrieval: nothing });
    const response = await handleChatRequest(request(), below.deps);

    expect(below.retrieve).toHaveBeenCalledOnce();
    expect(below.provider.complete).not.toHaveBeenCalled();
    expect(response.body).toMatchObject({ code: "UNKNOWN", supported: false });
    expect(response.status).toBe(200);
  });

  it("calls the provider exactly once on the happy path", async () => {
    await handleChatRequest(request(), h.deps);
    expect(h.provider.complete).toHaveBeenCalledOnce();
  });

  it("hands the provider only the question, language, and retrieved evidence", async () => {
    await handleChatRequest(request(), h.deps);

    expect(Object.keys(h.provider.complete.mock.calls[0][0]).sort()).toEqual([
      "evidence",
      "language",
      "question",
    ]);
  });
});

describe("chat handler responses", () => {
  it("returns a grounded answer with its sources", async () => {
    const response = await handleChatRequest(request(), harness().deps);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      apiVersion: "v1",
      code: "SUCCESS",
      supported: true,
      answer: "iJAC provides managed IT support.",
      language: "en",
    });
  });

  it("fails closed to UNKNOWN when the provider answer is not grounded in the evidence", async () => {
    const ungrounded = harness({
      outcome: {
        ok: true,
        output: { ...groundedOutput, answer: "iJAC offers 24/7 hosting for 9 USD per month." },
      },
    });
    const response = await handleChatRequest(request(), ungrounded.deps);

    expect(response.body).toMatchObject({ code: "UNKNOWN", supported: false });
    expect(JSON.stringify(response.body)).not.toContain("24/7");
  });

  it("reports a provider outage without leaking its cause", async () => {
    const down = harness({
      outcome: {
        ok: false,
        classification: { category: "provider_unavailable", code: "PROVIDER_UNAVAILABLE", retryEligible: false },
      },
    });
    const response = await handleChatRequest(request(), down.deps);

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({ code: "PROVIDER_UNAVAILABLE", supported: false });
  });

  it("maps a rate-limited provider to 429", async () => {
    const limited = harness({
      outcome: {
        ok: false,
        classification: { category: "rate_limited", code: "RATE_LIMITED", retryEligible: false },
      },
    });
    expect((await handleChatRequest(request(), limited.deps)).status).toBe(429);
  });

  it("returns 503 when the deploy flag is off", async () => {
    const off = harness({ config: configWith({ CHAT_API_ENABLED: "false" }) });
    const response = await handleChatRequest(request(), off.deps);

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({ code: "DISABLED" });
  });

  it.each([
    [{ method: "GET" }, 405],
    [{ contentType: "text/plain" }, 415],
    [{ body: "{not json" }, 400],
  ])("maps envelope rejection %o to status %i", async (override, status) => {
    expect((await handleChatRequest(request(override), harness().deps)).status).toBe(status);
  });

  it("answers a preflight request without consuming quota", async () => {
    const h = harness();
    const response = await handleChatRequest(request({ method: "OPTIONS" }), h.deps);

    expect(response.status).toBe(204);
    expect(h.kv.keys()).toEqual([]);
    expect(h.provider.complete).not.toHaveBeenCalled();
  });
});

describe("chat handler safety", () => {
  it.each([
    {},
    { origin: "https://evil.example" },
    { body: "{not json" },
    { method: "OPTIONS" },
  ])("carries CORS headers on the %o response", async (override) => {
    const response = await handleChatRequest(request(override), harness().deps);
    expect(response.headers).toHaveProperty("Vary", "Origin");
  });

  it("emits only contract-valid bodies for every outcome", async () => {
    const cases: Harness[] = [
      harness(),
      harness({ retrieval: nothing }),
      harness({ config: configWith({ CHAT_API_ENABLED: "false" }) }),
      harness({
        outcome: {
          ok: false,
          classification: { category: "timeout", code: "PROVIDER_UNAVAILABLE", retryEligible: false },
        },
      }),
    ];

    for (const c of cases) {
      const response = await handleChatRequest(request(), c.deps);
      expect(() => chatResponseSchema.parse(response.body)).not.toThrow();
    }
  });

  it("never returns an answer on a failing outcome", async () => {
    const response = await handleChatRequest(request(), harness({ retrieval: nothing }).deps);
    expect(response.body).not.toHaveProperty("answer");
    expect(response.body).not.toHaveProperty("sources");
  });

  it("does not mutate the incoming request", async () => {
    const raw = request();
    const snapshot = JSON.stringify(raw);
    await handleChatRequest(raw, harness().deps);

    expect(JSON.stringify(raw)).toBe(snapshot);
  });

  it("keeps no state between requests, so a second caller is judged independently", async () => {
    const h = harness();
    await handleChatRequest(request(), h.deps);
    const second = await handleChatRequest(request(), h.deps);

    expect(second.body).toMatchObject({ code: "SUCCESS" });
  });

  it("returns telemetry that carries no question, answer, or address", async () => {
    const response = await handleChatRequest(request(), harness().deps);
    const serialized = JSON.stringify(response.telemetry);

    expect(response.telemetry).toMatchObject({ outcome: "SUCCESS", language: "en" });
    for (const leak of ["What services", "managed IT support", "203.0.113.7", "gsk-"]) {
      expect(serialized).not.toContain(leak);
    }
  });

  it("records the source IDs that grounded a successful answer", async () => {
    const response = await handleChatRequest(request(), harness().deps);
    if (!response.telemetry) throw new Error("a completed request must report telemetry");
    expect(response.telemetry.sourceIds).toEqual(["managed-it-support"]);
  });
});
