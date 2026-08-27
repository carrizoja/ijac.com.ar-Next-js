import { beforeEach, describe, expect, it } from "vitest";
import {
  KILL_SWITCH_KEY,
  classifyProviderFailure,
  deriveClientKey,
  evaluateGate,
  shouldRetry,
} from "./controls";
import { loadChatApiConfig, type ChatApiConfig } from "./config";
import { FakeRedis } from "./testing/fakeRedis";

function configWith(overrides: Record<string, string> = {}): ChatApiConfig {
  const result = loadChatApiConfig({
    GROQ_API_KEY: "gsk-secret-value",
    GROQ_MODEL: "llama-3.3-70b-versatile",
    CHAT_API_ENABLED: "true",
    CHAT_API_ALLOWED_ORIGINS: "https://ijac.com.ar",
    CHAT_API_CLIENT_KEY_SECRET: "hmac-secret-value",
    CHAT_API_CLIENT_QUOTA: "3",
    CHAT_API_GLOBAL_QUOTA: "5",
    CHAT_API_QUOTA_WINDOW_SECONDS: "3600",
    CHAT_API_TIMEOUT_MS: "8000",
    CHAT_API_MAX_BYTES: "2048",
    ...overrides,
  });
  if (!result.ok) throw new Error(`fixture config must load: ${result.errors.join("; ")}`);
  return result.config;
}

const config = configWith();
const clientIp = "203.0.113.7";

describe("client key derivation", () => {
  it("is stable for the same address and secret", () => {
    expect(deriveClientKey(clientIp, config)).toBe(deriveClientKey(clientIp, config));
  });

  it("differs for a different address", () => {
    expect(deriveClientKey(clientIp, config)).not.toBe(deriveClientKey("198.51.100.4", config));
  });

  it("differs when the secret rotates, so old keys cannot be correlated", () => {
    const rotated = configWith({ CHAT_API_CLIENT_KEY_SECRET: "rotated-secret" });
    expect(deriveClientKey(clientIp, config)).not.toBe(deriveClientKey(clientIp, rotated));
  });

  it("never contains the raw address and is not reversible by inspection", () => {
    const key = deriveClientKey(clientIp, config);
    expect(key).not.toContain(clientIp);
    expect(key).not.toContain("203");
    expect(key).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("request gate", () => {
  let kv: FakeRedis;
  beforeEach(() => {
    kv = new FakeRedis();
  });

  const gate = (cfg: ChatApiConfig = config, store: FakeRedis = kv) =>
    evaluateGate({ config: cfg, kv: store, clientKey: deriveClientKey(clientIp, cfg) });

  it("allows a request within both quotas", async () => {
    await expect(gate()).resolves.toMatchObject({ allowed: true });
  });

  it("blocks every request when the deploy flag is off", async () => {
    const result = await gate(configWith({ CHAT_API_ENABLED: "false" }));
    expect(result).toMatchObject({ allowed: false, code: "DISABLED", category: "disabled" });
  });

  it("consumes no quota when the deploy flag is off", async () => {
    await gate(configWith({ CHAT_API_ENABLED: "false" }));
    expect(kv.keys()).toEqual([]);
  });

  it("blocks every request when the operational kill switch is set", async () => {
    kv.seed(KILL_SWITCH_KEY, "1");
    const result = await gate();
    expect(result).toMatchObject({ allowed: false, code: "DISABLED", category: "kill_switch" });
  });

  it("consumes no quota when the kill switch is set", async () => {
    kv.seed(KILL_SWITCH_KEY, "1");
    await gate();
    expect(kv.keys()).toEqual([KILL_SWITCH_KEY]);
  });

  it("blocks the client after its quota is spent", async () => {
    for (let i = 0; i < 3; i++) expect(await gate()).toMatchObject({ allowed: true });
    expect(await gate()).toMatchObject({
      allowed: false,
      code: "RATE_LIMITED",
      category: "quota_exceeded",
    });
  });

  it("blocks on the global quota even when a fresh client is under its own limit", async () => {
    const generous = configWith({ CHAT_API_CLIENT_QUOTA: "100", CHAT_API_GLOBAL_QUOTA: "2" });
    const key = deriveClientKey(clientIp, generous);
    for (let i = 0; i < 2; i++) {
      expect(await evaluateGate({ config: generous, kv, clientKey: key })).toMatchObject({ allowed: true });
    }
    const other = await evaluateGate({
      config: generous,
      kv,
      clientKey: deriveClientKey("198.51.100.4", generous),
    });
    expect(other).toMatchObject({ allowed: false, code: "RATE_LIMITED", category: "quota_exceeded" });
  });

  it("applies the configured window as the TTL on every counter it creates", async () => {
    await gate();
    for (const key of kv.keys()) {
      expect(kv.ttlOf(key)).toBe(config.quotaWindowSeconds);
    }
  });

  it("stores no raw address in any key it writes", async () => {
    await gate();
    expect(kv.keys().join("|")).not.toContain(clientIp);
  });

  it("fails closed when the KV store is unreachable", async () => {
    kv.startOutage();
    const result = await gate();
    expect(result).toMatchObject({
      allowed: false,
      code: "PROVIDER_UNAVAILABLE",
      category: "provider_unavailable",
    });
  });

  it("reports no KV error detail that could carry payload text", async () => {
    kv.startOutage();
    expect(JSON.stringify(await gate())).not.toContain("KV unavailable");
  });
});

describe("provider failure classification", () => {
  it.each([
    [{ kind: "timeout" } as const, "timeout", "PROVIDER_UNAVAILABLE", false],
    [{ kind: "connection" } as const, "provider_unavailable", "PROVIDER_UNAVAILABLE", false],
    [{ kind: "status", status: 429 } as const, "rate_limited", "RATE_LIMITED", false],
    [{ kind: "status", status: 404 } as const, "provider_unavailable", "PROVIDER_UNAVAILABLE", false],
    [{ kind: "status", status: 400 } as const, "provider_unavailable", "PROVIDER_UNAVAILABLE", false],
    [{ kind: "status", status: 500 } as const, "provider_unavailable", "PROVIDER_UNAVAILABLE", true],
    [{ kind: "status", status: 502 } as const, "provider_unavailable", "PROVIDER_UNAVAILABLE", true],
    [{ kind: "status", status: 503 } as const, "provider_unavailable", "PROVIDER_UNAVAILABLE", true],
  ])("classifies %o", (failure, category, code, retryEligible) => {
    expect(classifyProviderFailure(failure)).toEqual({ category, code, retryEligible });
  });

  it("treats a removed model as permanent, because retrying cannot bring it back", () => {
    expect(classifyProviderFailure({ kind: "status", status: 404 }).retryEligible).toBe(false);
  });
});

describe("retry budget", () => {
  it("retries an eligible 5xx exactly once", () => {
    const failure = { kind: "status", status: 503 } as const;
    expect(shouldRetry(failure, 0)).toBe(true);
    expect(shouldRetry(failure, 1)).toBe(false);
  });

  it.each([
    { kind: "timeout" } as const,
    { kind: "connection" } as const,
    { kind: "status", status: 429 } as const,
    { kind: "status", status: 404 } as const,
  ])("never retries %o", (failure) => {
    expect(shouldRetry(failure, 0)).toBe(false);
  });
});
