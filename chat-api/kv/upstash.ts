import type { ChatApiConfig } from "../config.js";
import type { KvClient } from "../controls.js";

/**
 * KvClient over the Upstash REST protocol.
 *
 * Deliberately a thin fetch wrapper rather than an SDK: the gate needs three commands, and a
 * dependency-free implementation keeps the server package small and its failure modes obvious.
 *
 * Every failure throws. `evaluateGate` catches and returns PROVIDER_UNAVAILABLE, so an
 * unreachable or misbehaving store fails closed instead of serving unmetered traffic.
 * Thrown messages are fixed strings — the token and the upstream body never appear in them,
 * because an error can travel further than the request that produced it.
 */
export function createUpstashKvClient(
  config: ChatApiConfig,
  fetchImpl: typeof fetch = fetch,
): KvClient {
  const base = config.kvUrl.replace(/\/+$/, "");

  async function command(path: string): Promise<unknown> {
    let response: Response;

    try {
      response = await fetchImpl(`${base}/${path}`, {
        headers: { authorization: `Bearer ${config.kvToken}` },
        signal: AbortSignal.timeout(config.timeoutMs),
      });
    } catch {
      throw new Error("KV request failed");
    }

    if (!response.ok) throw new Error(`KV request rejected with status ${response.status}`);

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new Error("KV response was not JSON");
    }

    if (!payload || typeof payload !== "object") throw new Error("KV response was malformed");

    const body = payload as { result?: unknown; error?: unknown };
    if (body.error !== undefined) throw new Error("KV command reported an error");

    return body.result;
  }

  /** Encoded so an HMAC suffix or hostile key can never alter the request path. */
  const segment = (key: string) => encodeURIComponent(key);

  return {
    async get(key) {
      const result = await command(`get/${segment(key)}`);
      if (result === null || result === undefined) return null;
      return String(result);
    },

    async incr(key) {
      const result = await command(`incr/${segment(key)}`);
      if (typeof result !== "number" || !Number.isFinite(result)) {
        throw new Error("KV incr did not return a number");
      }
      return result;
    },

    async expire(key, seconds) {
      await command(`expire/${segment(key)}/${seconds}`);
    },
  };
}
