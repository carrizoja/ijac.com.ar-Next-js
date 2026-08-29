import { describe, expect, it } from "vitest";
import { createChatApp } from "./app";

const validEnv: Record<string, string | undefined> = {
  GROQ_API_KEY: "gsk-secret-value",
  GROQ_MODEL: "openai/gpt-oss-120b",
  CHAT_API_ENABLED: "true",
  CHAT_API_ALLOWED_ORIGINS: "https://ijac.com.ar",
  CHAT_API_CLIENT_KEY_SECRET: "hmac-secret-value",
  CHAT_API_CLIENT_QUOTA: "10",
  CHAT_API_GLOBAL_QUOTA: "500",
  CHAT_API_QUOTA_WINDOW_SECONDS: "3600",
  CHAT_API_TIMEOUT_MS: "8000",
  CHAT_API_MAX_BYTES: "2048",
  CHAT_API_KV_URL: "https://kv.example.upstash.io",
  CHAT_API_KV_TOKEN: "kv-token-value",
};

const groundedAnswer = {
  supported: true,
  answer: "iJAC handles hardware and software incidents on Mac computers and Apple devices.",
  language: "en",
  sources: [{ id: "soporte-tecnico-pc-mac-apple" }],
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** One fake transport standing in for both the KV store and Groq, routed by host. */
function transport(options: { kvDown?: boolean; answer?: unknown } = {}) {
  const kvUrls: string[] = [];
  const groqCalls: string[] = [];

  const impl = async (url: unknown, init: { body?: string } = {}) => {
    const target = String(url);

    if (target.includes("upstash")) {
      kvUrls.push(target);
      if (options.kvDown) return json({ error: "unavailable" }, 503);
      if (target.includes("/get/")) return json({ result: null });
      if (target.includes("/incr/")) return json({ result: 1 });
      return json({ result: 1 });
    }

    groqCalls.push(String(init.body ?? ""));
    return json({
      choices: [{ message: { content: JSON.stringify(options.answer ?? groundedAnswer) } }],
    });
  };

  return { impl: impl as unknown as typeof fetch, kvUrls, groqCalls };
}

function appOrThrow(overrides: Parameters<typeof createChatApp>[1]) {
  const result = createChatApp(validEnv, overrides);
  if (!result.ok) throw new Error(`expected the app to build: ${result.errors.join("; ")}`);
  return result.handler;
}

function ask(question: string, headers: Record<string, string> = {}) {
  return new Request("https://api.ijac.com.ar/v1/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://ijac.com.ar",
      "x-forwarded-for": "203.0.113.7",
      ...headers,
    },
    body: JSON.stringify({ apiVersion: "v1", question, language: "en" }),
  });
}

describe("chat app construction", () => {
  it("reports configuration errors instead of throwing", () => {
    const result = createChatApp({}, {});

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.errors.length).toBeGreaterThan(1);
  });

  it("names the missing variable so a misconfigured deploy is diagnosable", () => {
    const result = createChatApp({ ...validEnv, CHAT_API_KV_TOKEN: undefined }, {});

    if (result.ok) throw new Error("expected failure");
    expect(result.errors.join(" ")).toContain("CHAT_API_KV_TOKEN");
  });

  it("builds a Request to Response handler from a complete environment", () => {
    const { impl } = transport();
    expect(typeof appOrThrow({ fetch: impl })).toBe("function");
  });
});

describe("chat app end to end", () => {
  it("answers an approved question with a grounded answer and its sources", async () => {
    const { impl, groqCalls } = transport();
    const response = await appOrThrow({ fetch: impl })(ask("Can you fix my MacBook?"));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      apiVersion: "v1",
      code: "SUCCESS",
      supported: true,
      answer: "iJAC handles hardware and software incidents on Mac computers and Apple devices.",
      // The model cited an id only; title and url are resolved from the approved entry.
      sources: [{
        id: "soporte-tecnico-pc-mac-apple",
        title: "Technical support for PC, Mac, and Apple devices",
        url: "https://ijac.com.ar/services/soporte-tecnico-pc-mac-apple",
      }],
    });
    expect(groqCalls).toHaveLength(1);
  });

  it("hands off an off-script question without calling the provider", async () => {
    const { impl, groqCalls } = transport();
    const response = await appOrThrow({ fetch: impl })(
      ask("Who won the 1998 football world cup?"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ code: "UNKNOWN", supported: false });
    expect(groqCalls).toHaveLength(0);
  });

  it("rejects a disallowed origin without touching the KV store or the provider", async () => {
    const { impl, kvUrls, groqCalls } = transport();
    const response = await appOrThrow({ fetch: impl })(
      ask("Can you fix my MacBook?", { origin: "https://evil.example" }),
    );

    expect(response.status).toBe(403);
    expect(kvUrls).toEqual([]);
    expect(groqCalls).toEqual([]);
  });

  it("fails closed when the KV store is unreachable", async () => {
    const { impl, groqCalls } = transport({ kvDown: true });
    const response = await appOrThrow({ fetch: impl })(ask("Can you fix my MacBook?"));

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
    expect(groqCalls).toEqual([]);
  });

  it("fails closed to UNKNOWN when the provider answer is not grounded", async () => {
    const { impl } = transport({
      answer: { ...groundedAnswer, answer: "iJAC guarantees 99.999% uptime for 5 USD." },
    });
    const response = await appOrThrow({ fetch: impl })(ask("Can you fix my MacBook?"));

    expect(await response.json()).toMatchObject({ code: "UNKNOWN", supported: false });
  });

  it("keys quotas by an HMAC of the caller, never the raw address", async () => {
    const { impl, kvUrls } = transport();
    await appOrThrow({ fetch: impl })(ask("Can you fix my MacBook?"));

    expect(kvUrls.join("|")).not.toContain("203.0.113.7");
    expect(kvUrls.some((url) => url.includes("quota%3Aclient"))).toBe(true);
  });

  it("answers a preflight without consulting the KV store", async () => {
    const { impl, kvUrls } = transport();
    const response = await appOrThrow({ fetch: impl })(
      new Request("https://api.ijac.com.ar/v1/chat", {
        method: "OPTIONS",
        headers: { origin: "https://ijac.com.ar" },
      }),
    );

    expect(response.status).toBe(204);
    expect(kvUrls).toEqual([]);
  });

  it("returns a contract-shaped body and CORS headers on every path", async () => {
    const { impl } = transport();
    const response = await appOrThrow({ fetch: impl })(ask("Can you fix my MacBook?"));

    expect(response.headers.get("vary")).toBe("Origin");
    expect(response.headers.get("access-control-allow-origin")).toBe("https://ijac.com.ar");
    expect(response.headers.get("content-type")).toContain("application/json");
  });

  it("never leaks a secret or telemetry into the response body", async () => {
    const { impl } = transport();
    const response = await appOrThrow({ fetch: impl })(ask("Can you fix my MacBook?"));
    const text = await response.text();

    for (const secret of ["gsk-secret-value", "hmac-secret-value", "kv-token-value", "latencyBand"]) {
      expect(text).not.toContain(secret);
    }
  });
});
