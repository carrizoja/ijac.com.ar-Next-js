import { afterEach, describe, expect, it, vi } from "vitest";
import entry from "./chat";

/**
 * Vercel's Node runtime decides a function's calling convention from the shape of its export.
 * A bare `export default function handler(...)` is invoked with Node's `IncomingMessage` and
 * `ServerResponse`; only the documented `fetch` Web Standard export — `export default { fetch }`
 * — is invoked with a Web `Request` and expected to return a `Response`.
 *
 * This module is written against the Web API, so exporting the wrong shape deploys cleanly and
 * then throws `TypeError: request.headers.get is not a function` on every single request. No
 * other suite can see it: they all call `createChatRoute`'s handler directly and never touch
 * the export Vercel actually reads.
 */
const validEnv: Record<string, string> = {
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

/** Refused by the CORS envelope before the gate, so it never reaches the KV store or Groq. */
const originlessRequest = () =>
  new Request("https://api.ijac.com.ar/v1/chat", { method: "POST" });

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("serverless entry point", () => {
  it("uses the fetch Web Standard export shape Vercel invokes with a Request", () => {
    expect(typeof entry).toBe("object");
    expect(typeof (entry as { fetch?: unknown }).fetch).toBe("function");
  });

  it("fails closed with a bare 503 when the environment is incomplete", async () => {
    const response = await entry.fetch(originlessRequest());

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(503);
    // A public endpoint must not describe its own misconfiguration.
    expect(await response.text()).toBe("");
  });

  it("routes a Web Request through the composed app once configured", async () => {
    vi.resetModules();
    for (const [key, value] of Object.entries(validEnv)) vi.stubEnv(key, value);

    const configured = (await import("./chat")).default;
    const response = await configured.fetch(originlessRequest());

    expect(response).toBeInstanceOf(Response);
    // 403 proves the request reached the real handler rather than the misconfiguration stub.
    expect(response.status).toBe(403);
  });
});
