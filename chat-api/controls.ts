import { createHmac } from "node:crypto";
import type { ChatResultCode } from "../packages/contracts/chat.js";
import type { ErrorCategory } from "./privacy.js";
import type { ChatApiConfig } from "./config.js";

/** Operational kill switch, flipped in the KV store without a redeploy. */
export const KILL_SWITCH_KEY = "chat-api:kill-switch";
const GLOBAL_QUOTA_KEY = "chat-api:quota:global";

export interface KvClient {
  get(key: string): Promise<string | null>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
}

export type GateDecision =
  | { allowed: true }
  | { allowed: false; code: ChatResultCode; category: ErrorCategory };

export type ProviderFailure =
  | { kind: "timeout" }
  | { kind: "connection" }
  | { kind: "status"; status: number };

export interface ProviderClassification {
  category: ErrorCategory;
  code: ChatResultCode;
  retryEligible: boolean;
}

export interface GateInput {
  config: ChatApiConfig;
  kv: KvClient;
  clientKey: string;
}

/**
 * Derives a per-client quota key from the caller address.
 * The address is never stored: only the HMAC digest leaves this function, and rotating
 * the secret makes previously issued keys uncorrelatable.
 */
export function deriveClientKey(address: string, config: ChatApiConfig): string {
  return createHmac("sha256", config.clientKeySecret).update(address).digest("hex");
}

function blocked(code: ChatResultCode, category: ErrorCategory): GateDecision {
  return { allowed: false, code, category };
}

/** Increments a fixed-window counter, applying the window TTL when the window opens. */
async function consume(kv: KvClient, key: string, windowSeconds: number): Promise<number> {
  const count = await kv.incr(key);
  if (count === 1) await kv.expire(key, windowSeconds);
  return count;
}

/**
 * Decides whether a request may reach the provider.
 * Every failure path returns a bounded code and category — a KV error message never escapes.
 */
export async function evaluateGate({ config, kv, clientKey }: GateInput): Promise<GateDecision> {
  if (!config.enabled) return blocked("DISABLED", "disabled");

  try {
    if ((await kv.get(KILL_SWITCH_KEY)) !== null) {
      return blocked("DISABLED", "kill_switch");
    }

    const global = await consume(kv, GLOBAL_QUOTA_KEY, config.quotaWindowSeconds);
    if (global > config.globalQuota) return blocked("RATE_LIMITED", "quota_exceeded");

    const client = await consume(kv, `chat-api:quota:client:${clientKey}`, config.quotaWindowSeconds);
    if (client > config.clientQuota) return blocked("RATE_LIMITED", "quota_exceeded");

    return { allowed: true };
  } catch {
    return blocked("PROVIDER_UNAVAILABLE", "provider_unavailable");
  }
}

export function classifyProviderFailure(failure: ProviderFailure): ProviderClassification {
  if (failure.kind === "timeout") {
    return { category: "timeout", code: "PROVIDER_UNAVAILABLE", retryEligible: false };
  }
  if (failure.kind === "connection") {
    return { category: "provider_unavailable", code: "PROVIDER_UNAVAILABLE", retryEligible: false };
  }
  if (failure.status === 429) {
    return { category: "rate_limited", code: "RATE_LIMITED", retryEligible: false };
  }
  // Only 5xx is transient. A removed model answers 404 and would fail identically on retry.
  return {
    category: "provider_unavailable",
    code: "PROVIDER_UNAVAILABLE",
    retryEligible: failure.status >= 500,
  };
}

/** At most one retry, and only for an eligible 5xx. */
export function shouldRetry(failure: ProviderFailure, attempt: number): boolean {
  return attempt === 0 && classifyProviderFailure(failure).retryEligible;
}
