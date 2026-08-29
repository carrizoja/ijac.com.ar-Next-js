import { describe, expect, it } from "vitest";
import { corsHeaders, preflightResponse, validateChatRequest } from "./cors";
import { loadChatApiConfig, type ChatApiConfig } from "./config";

const config: ChatApiConfig = (() => {
  const result = loadChatApiConfig({
    GROQ_API_KEY: "gsk-secret-value",
    GROQ_MODEL: "openai/gpt-oss-120b",
    CHAT_API_ENABLED: "true",
    CHAT_API_ALLOWED_ORIGINS: "https://ijac.com.ar,https://www.ijac.com.ar",
    CHAT_API_CLIENT_KEY_SECRET: "hmac-secret-value",
    CHAT_API_CLIENT_QUOTA: "10",
    CHAT_API_GLOBAL_QUOTA: "500",
    CHAT_API_QUOTA_WINDOW_SECONDS: "3600",
    CHAT_API_TIMEOUT_MS: "8000",
    CHAT_API_MAX_BYTES: "2048",
    CHAT_API_KV_URL: "https://kv.example.upstash.io",
    CHAT_API_KV_TOKEN: "kv-token-value",
  });
  if (!result.ok) throw new Error("fixture config must load");
  return result.config;
})();

const validBody = JSON.stringify({ apiVersion: "v1", question: "What services do you offer?", language: "en" });

function request(overrides: Partial<Parameters<typeof validateChatRequest>[0]> = {}) {
  return validateChatRequest(
    {
      method: "POST",
      origin: "https://ijac.com.ar",
      contentType: "application/json",
      body: validBody,
      ...overrides,
    },
    config,
  );
}

describe("chat API request envelope", () => {
  it("accepts a well-formed same-origin POST and returns the parsed request", () => {
    const result = request();
    if (!result.ok) throw new Error(`expected acceptance, got ${result.code}`);
    expect(result.request).toEqual({
      apiVersion: "v1",
      question: "What services do you offer?",
      language: "en",
    });
  });

  it.each(["GET", "PUT", "DELETE", "PATCH", "HEAD"])("rejects the %s method", (method) => {
    const result = request({ method });
    expect(result).toMatchObject({ ok: false, code: "INVALID_REQUEST", status: 405 });
  });

  it.each(["text/plain", "application/x-www-form-urlencoded", "multipart/form-data", null])(
    "rejects content type %s",
    (contentType) => {
      const result = request({ contentType });
      expect(result).toMatchObject({ ok: false, code: "INVALID_REQUEST", status: 415 });
    },
  );

  it("accepts a JSON content type that carries a charset parameter", () => {
    expect(request({ contentType: "application/json; charset=utf-8" }).ok).toBe(true);
  });

  it("rejects a body larger than the configured byte limit", () => {
    const body = JSON.stringify({ apiVersion: "v1", question: "x".repeat(3000), language: "en" });
    expect(request({ body })).toMatchObject({ ok: false, code: "INVALID_REQUEST", status: 413 });
  });

  it("measures the size limit in UTF-8 bytes rather than characters", () => {
    const body = JSON.stringify({ apiVersion: "v1", question: "ñ".repeat(30), language: "es" });
    // Every ñ is one character but two UTF-8 bytes, so a character-based limit would let this through.
    expect(body.length).toBeLessThanOrEqual(90);
    expect(new TextEncoder().encode(body).length).toBeGreaterThan(90);
    const result = validateChatRequest(
      { method: "POST", origin: "https://ijac.com.ar", contentType: "application/json", body },
      { ...config, maxRequestBytes: 90 },
    );
    expect(result).toMatchObject({ ok: false, status: 413 });
  });

  it("rejects malformed JSON without leaking the parser error", () => {
    const result = request({ body: "{not json" });
    expect(result).toMatchObject({ ok: false, code: "INVALID_REQUEST", status: 400 });
    expect(JSON.stringify(result)).not.toContain("not json");
  });

  it.each(["https://evil.example", "http://ijac.com.ar", "https://ijac.com.ar.evil.example", null])(
    "rejects origin %s",
    (origin) => {
      expect(request({ origin })).toMatchObject({ ok: false, code: "INVALID_REQUEST", status: 403 });
    },
  );

  it("rejects a disallowed origin before parsing the body at all", () => {
    const result = request({ origin: "https://evil.example", body: "{not json" });
    expect(result).toMatchObject({ ok: false, status: 403 });
  });

  it.each([
    { transcript: [{ role: "user", text: "earlier" }] },
    { history: ["earlier"] },
    { stream: true },
    { attachments: ["file.pdf"] },
  ])("rejects an extra request field %o", (extra) => {
    const body = JSON.stringify({ apiVersion: "v1", question: "What services?", language: "en", ...extra });
    expect(request({ body })).toMatchObject({ ok: false, code: "INVALID_REQUEST", status: 400 });
  });

  it.each(["fr", "de", "", "ES"])("rejects unsupported language %s", (language) => {
    const body = JSON.stringify({ apiVersion: "v1", question: "What services?", language });
    expect(request({ body })).toMatchObject({ ok: false, code: "INVALID_REQUEST", status: 400 });
  });

  it("rejects a mismatched contract version", () => {
    const body = JSON.stringify({ apiVersion: "v2", question: "What services?", language: "en" });
    expect(request({ body })).toMatchObject({ ok: false, code: "INVALID_REQUEST", status: 400 });
  });
});

describe("chat API CORS headers", () => {
  it("echoes the exact allowed origin and never a wildcard", () => {
    const headers = corsHeaders("https://www.ijac.com.ar", config);
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://www.ijac.com.ar");
    expect(Object.values(headers)).not.toContain("*");
  });

  it("emits no allow-origin header for a disallowed origin", () => {
    expect(corsHeaders("https://evil.example", config)["Access-Control-Allow-Origin"]).toBeUndefined();
  });

  it("varies on Origin so a permissive response is never cached across origins", () => {
    expect(corsHeaders("https://ijac.com.ar", config).Vary).toBe("Origin");
  });

  it("answers preflight for an allowed origin with POST and JSON only", () => {
    const response = preflightResponse("https://ijac.com.ar", config);
    expect(response.status).toBe(204);
    expect(response.headers["Access-Control-Allow-Methods"]).toBe("POST, OPTIONS");
    expect(response.headers["Access-Control-Allow-Headers"]).toBe("Content-Type");
  });

  it("refuses preflight from a disallowed origin", () => {
    expect(preflightResponse("https://evil.example", config).status).toBe(403);
  });
});
