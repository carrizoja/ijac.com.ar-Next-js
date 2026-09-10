import type { KnowledgeEntry } from "../packages/knowledge/types.js";
import { createKnowledgeRetriever } from "../packages/knowledge/retriever.js";
import { approvedServiceEntries } from "../packages/knowledge/fixtures/services.js";
import { loadChatApiConfig } from "./config.js";
import { createUpstashKvClient } from "./kv/upstash.js";
import { createGroqProvider } from "./providers/groq.js";
import { handleChatRequest } from "./v1/chat.js";
import { createChatRoute } from "./v1/route.js";

export interface CreateChatAppOverrides {
  /** Injection seam for tests; production uses the platform transport. */
  fetch?: typeof fetch;
  /** Defaults to the approved knowledge set. */
  entries?: readonly KnowledgeEntry[];
}

export type CreateChatAppResult =
  | { ok: true; handler: (request: Request) => Promise<Response> }
  | { ok: false; errors: string[] };

/**
 * Composition root: turns an environment record into a fetch handler.
 *
 * Nothing below this point reads process.env, so every layer stays injectable and testable.
 * Configuration problems are returned rather than thrown, so a misconfigured deployment reports
 * which variables are wrong instead of crashing on the first request.
 */
export function createChatApp(
  env: Record<string, string | undefined>,
  overrides: CreateChatAppOverrides = {},
): CreateChatAppResult {
  const loaded = loadChatApiConfig(env);
  if (!loaded.ok) return { ok: false, errors: loaded.errors };

  const config = loaded.config;
  const kv = createUpstashKvClient(config, overrides.fetch);
  const provider = createGroqProvider(config, overrides.fetch ? { fetch: overrides.fetch } : {});
  const retrieve = createKnowledgeRetriever(overrides.entries ?? approvedServiceEntries);

  const handler = createChatRoute((raw, clientAddress) =>
    handleChatRequest(raw, { config, kv, provider, retrieve, clientAddress }),
  );

  return { ok: true, handler };
}
