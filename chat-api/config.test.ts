import { describe, expect, it } from "vitest";
import { loadChatApiConfig, redactConfig } from "./config";

const validEnv = {
  GROQ_API_KEY: "gsk-secret-value",
  GROQ_MODEL: "llama-3.3-70b-versatile",
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
};

function loadOrThrow(env: Record<string, string | undefined>) {
  const result = loadChatApiConfig(env);
  if (!result.ok) throw new Error(`expected config to load: ${result.errors.join("; ")}`);
  return result.config;
}

describe("chat API configuration", () => {
  it("loads every setting from a complete environment", () => {
    expect(loadOrThrow(validEnv)).toEqual({
      groqApiKey: "gsk-secret-value",
      groqModel: "llama-3.3-70b-versatile",
      enabled: true,
      allowedOrigins: ["https://ijac.com.ar", "https://www.ijac.com.ar"],
      clientKeySecret: "hmac-secret-value",
      clientQuota: 10,
      globalQuota: 500,
      quotaWindowSeconds: 3600,
      timeoutMs: 8000,
      maxRequestBytes: 2048,
      kvUrl: "https://kv.example.upstash.io",
      kvToken: "kv-token-value",
    });
  });

  it.each([
    "GROQ_API_KEY",
    "GROQ_MODEL",
    "CHAT_API_CLIENT_KEY_SECRET",
    "CHAT_API_ALLOWED_ORIGINS",
    "CHAT_API_KV_URL",
    "CHAT_API_KV_TOKEN",
  ])(
    "fails closed when %s is missing",
    (key) => {
      const result = loadChatApiConfig({ ...validEnv, [key]: undefined });
      expect(result.ok).toBe(false);
    },
  );

  it("reports every missing setting at once rather than only the first", () => {
    const result = loadChatApiConfig({});
    if (result.ok) throw new Error("expected failure");
    expect(result.errors.length).toBeGreaterThan(1);
  });

  it("treats the deploy flag as off unless it is exactly true", () => {
    expect(loadOrThrow({ ...validEnv, CHAT_API_ENABLED: "false" }).enabled).toBe(false);
    expect(loadOrThrow({ ...validEnv, CHAT_API_ENABLED: undefined }).enabled).toBe(false);
    expect(loadOrThrow({ ...validEnv, CHAT_API_ENABLED: "TRUE" }).enabled).toBe(false);
  });

  it("trims whitespace around configured origins", () => {
    const config = loadOrThrow({
      ...validEnv,
      CHAT_API_ALLOWED_ORIGINS: " https://ijac.com.ar , https://www.ijac.com.ar ",
    });
    expect(config.allowedOrigins).toEqual(["https://ijac.com.ar", "https://www.ijac.com.ar"]);
  });

  it.each(["*", "https://*.ijac.com.ar", "http://ijac.com.ar", "https://ijac.com.ar/chat", "ijac.com.ar"])(
    "rejects %s as a configured origin",
    (origin) => {
      expect(loadChatApiConfig({ ...validEnv, CHAT_API_ALLOWED_ORIGINS: origin }).ok).toBe(false);
    },
  );

  it.each(["0", "-1", "1.5", "many"])("rejects %s as a quota value", (value) => {
    expect(loadChatApiConfig({ ...validEnv, CHAT_API_CLIENT_QUOTA: value }).ok).toBe(false);
  });

  it("never exposes secrets in the redacted view used for diagnostics", () => {
    const redacted = redactConfig(loadOrThrow(validEnv));
    const serialized = JSON.stringify(redacted);
    expect(serialized).not.toContain("gsk-secret-value");
    expect(serialized).not.toContain("hmac-secret-value");
    expect(serialized).not.toContain("kv-token-value");
    expect(redacted.groqModel).toBe("llama-3.3-70b-versatile");
  });

  it.each(["http://kv.example.upstash.io", "kv.example.upstash.io", "not a url"])(
    "rejects %s as a KV URL",
    (url) => {
      expect(loadChatApiConfig({ ...validEnv, CHAT_API_KV_URL: url }).ok).toBe(false);
    },
  );
});
