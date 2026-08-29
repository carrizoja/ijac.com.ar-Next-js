import { describe, expect, it } from "vitest";
import { createUpstashKvClient } from "./upstash";
import { loadChatApiConfig, type ChatApiConfig } from "../config";
import type { KvClient } from "../controls";

const config: ChatApiConfig = (() => {
  const result = loadChatApiConfig({
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
  });
  if (!result.ok) throw new Error("fixture config must load");
  return result.config;
})();

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

interface Recorded {
  url: string;
  authorization: string | null;
  signal: AbortSignal | null | undefined;
}

function transport(...responders: Array<() => Response | Promise<never>>) {
  const calls: Recorded[] = [];
  const impl = async (url: unknown, init: RequestInit = {}) => {
    calls.push({
      url: String(url),
      authorization: new Headers(init.headers).get("authorization"),
      signal: init.signal,
    });
    return responders[Math.min(calls.length - 1, responders.length - 1)]();
  };
  return { impl: impl as unknown as typeof fetch, calls };
}

const client = (impl: typeof fetch) => createUpstashKvClient(config, impl);

describe("upstash kv client requests", () => {
  it("satisfies the KvClient interface the gate depends on", () => {
    const { impl } = transport(() => reply({ result: null }));
    const typed: KvClient = createUpstashKvClient(config, impl);

    expect(typeof typed.get).toBe("function");
    expect(typeof typed.incr).toBe("function");
    expect(typeof typed.expire).toBe("function");
  });

  it("reads a key from the REST get endpoint", async () => {
    const { impl, calls } = transport(() => reply({ result: "1" }));
    const value = await client(impl).get("chat-api:kill-switch");

    expect(calls[0].url).toBe("https://kv.example.upstash.io/get/chat-api%3Akill-switch");
    expect(value).toBe("1");
  });

  it("returns null for a missing key rather than a string", async () => {
    const { impl } = transport(() => reply({ result: null }));
    expect(await client(impl).get("chat-api:kill-switch")).toBeNull();
  });

  it("increments a counter and returns the new value as a number", async () => {
    const { impl, calls } = transport(() => reply({ result: 4 }));
    const next = await client(impl).incr("chat-api:quota:global");

    expect(calls[0].url).toBe("https://kv.example.upstash.io/incr/chat-api%3Aquota%3Aglobal");
    expect(next).toBe(4);
  });

  it("sets an expiry in seconds", async () => {
    const { impl, calls } = transport(() => reply({ result: 1 }));
    await client(impl).expire("chat-api:quota:global", 3600);

    expect(calls[0].url).toBe("https://kv.example.upstash.io/expire/chat-api%3Aquota%3Aglobal/3600");
  });

  it("encodes keys so an HMAC suffix cannot alter the request path", async () => {
    const { impl, calls } = transport(() => reply({ result: 1 }));
    await client(impl).incr("chat-api:quota:client:a/b?c=d");

    expect(calls[0].url).not.toContain("?");
    expect(calls[0].url.endsWith("a%2Fb%3Fc%3Dd")).toBe(true);
  });

  it("sends the token as a bearer header and never in the URL", async () => {
    const { impl, calls } = transport(() => reply({ result: null }));
    await client(impl).get("k");

    expect(calls[0].authorization).toBe("Bearer kv-token-value");
    expect(calls[0].url).not.toContain("kv-token-value");
  });

  it("bounds every call with an abort signal so a hung store cannot hang a request", async () => {
    const { impl, calls } = transport(() => reply({ result: null }));
    await client(impl).get("k");

    expect(calls[0].signal).toBeInstanceOf(AbortSignal);
  });
});

describe("upstash kv client failures", () => {
  it.each([401, 429, 500, 503])("throws on HTTP %i so the gate fails closed", async (status) => {
    const { impl } = transport(() => reply({ error: "upstream" }, status));
    await expect(client(impl).get("k")).rejects.toThrow();
  });

  it("throws when the body reports an error despite a 200", async () => {
    const { impl } = transport(() => reply({ error: "WRONGTYPE" }));
    await expect(client(impl).incr("k")).rejects.toThrow();
  });

  it("throws when the payload is not JSON", async () => {
    const { impl } = transport(() => new Response("<html>gateway</html>", { status: 200 }));
    await expect(client(impl).get("k")).rejects.toThrow();
  });

  it("throws when the network rejects", async () => {
    const { impl } = transport(() => Promise.reject(new Error("ECONNREFUSED")));
    await expect(client(impl).get("k")).rejects.toThrow();
  });

  it("throws when incr returns a non-numeric result", async () => {
    const { impl } = transport(() => reply({ result: "not-a-number" }));
    await expect(client(impl).incr("k")).rejects.toThrow();
  });

  it.each([
    () => reply({ error: "token kv-token-value is invalid" }, 200),
    () => reply({ error: "token kv-token-value is invalid" }, 401),
    () => Promise.reject(new Error("failed to reach kv-token-value host")) as Promise<never>,
  ])("never puts the token or the upstream body in the error it throws", async (responder) => {
    const { impl } = transport(responder);

    const thrown: unknown = await client(impl).get("k").then(
      () => { throw new Error("expected the call to reject"); },
      (error: unknown) => error,
    );

    expect(thrown).toBeInstanceOf(Error);
    expect(String((thrown as Error).message)).not.toContain("kv-token-value");
    expect(String((thrown as Error).message)).not.toContain("invalid");
  });
});
