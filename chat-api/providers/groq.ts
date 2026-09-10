import Groq, { APIConnectionError, APIConnectionTimeoutError, APIError } from "groq-sdk";
import { supportedLanguages, type SupportedLanguage } from "../../packages/contracts/chat.js";
import type { RetrievalMatch } from "../../packages/knowledge/retriever.js";
import type { ChatApiConfig } from "../config.js";
import {
  classifyProviderFailure,
  shouldRetry,
  type ProviderClassification,
  type ProviderFailure,
} from "../controls.js";

export interface ProviderInput {
  question: string;
  language: SupportedLanguage;
  evidence: readonly RetrievalMatch[];
}

export type ProviderOutcome =
  | { ok: true; output: unknown }
  | { ok: false; classification: ProviderClassification };

export interface ChatProvider {
  complete(input: ProviderInput): Promise<ProviderOutcome>;
}

export interface GroqProviderOptions {
  /** Injection seam for tests; omitted in production so the SDK uses its own transport. */
  fetch?: typeof fetch;
}

const INVALID_OUTPUT: ProviderClassification = {
  category: "invalid_output",
  code: "UNKNOWN",
  retryEligible: false,
};

const languageNames: Record<SupportedLanguage, string> = {
  es: "Spanish",
  en: "English",
  pt: "Portuguese",
};

/**
 * Strict shape the model must return. Prose outside these fields is impossible by construction.
 * Exported so tests can assert strict-mode validity without spending a live call.
 */
export const responseFormat = {
  type: "json_schema" as const,
  json_schema: {
    name: "grounded_answer",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["supported", "answer", "language", "sources"],
      properties: {
        supported: { type: "boolean" },
        answer: { type: "string" },
        language: { type: "string", enum: [...supportedLanguages] },
        // Ids only. Titles and urls are resolved server-side from the approved entry, so the
        // model has no field in which to fabricate one. Strict mode also requires every
        // declared property to be listed in "required".
        sources: {
          type: "array",
          maxItems: 3,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id"],
            properties: { id: { type: "string" } },
          },
        },
      },
    },
  },
};

/**
 * Reduces evidence to what the provider needs to ground an answer.
 * Governance metadata (owner, approval timestamps, version, aliases) is deliberately excluded.
 */
function toProviderEvidence(evidence: readonly RetrievalMatch[], language: SupportedLanguage) {
  return evidence.map(({ entry }) => ({
    id: entry.id,
    title: entry.title[language],
    claims: entry.claims,
    ...(entry.url ? { url: entry.url } : {}),
    ...(entry.validationRules ? { rules: entry.validationRules } : {}),
  }));
}

function systemPrompt(language: SupportedLanguage): string {
  return [
    "You answer visitor questions about iJAC IT Solutions.",
    "Use only the supplied evidence. Never introduce names, prices, hours, qualifiers, URLs, or claims that are absent from it.",
    "Cite only the evidence ids you actually used.",
    `Write the answer in ${languageNames[language]}.`,
    "If the evidence does not support an answer, set supported to false and leave the answer empty.",
  ].join(" ");
}

/** Maps an SDK throwable onto the shared failure model. Messages are discarded, never inspected. */
export function classifyGroqError(error: unknown): ProviderFailure {
  // APIConnectionTimeoutError extends APIConnectionError, so it must be tested first.
  if (error instanceof APIConnectionTimeoutError) return { kind: "timeout" };
  if (error instanceof APIConnectionError) return { kind: "connection" };
  if (error instanceof APIError && typeof error.status === "number") {
    return { kind: "status", status: error.status };
  }
  return { kind: "connection" };
}

export function createGroqProvider(
  config: ChatApiConfig,
  options: GroqProviderOptions = {},
): ChatProvider {
  const client = new Groq({
    apiKey: config.groqApiKey,
    timeout: config.timeoutMs,
    // The one-retry budget lives in controls.shouldRetry; the SDK's own layer (default 2) would exceed it.
    maxRetries: 0,
    ...(options.fetch ? { fetch: options.fetch } : {}),
  });

  return {
    async complete({ question, language, evidence }: ProviderInput): Promise<ProviderOutcome> {
      const body = {
        model: config.groqModel,
        response_format: responseFormat,
        messages: [
          { role: "system" as const, content: systemPrompt(language) },
          {
            role: "user" as const,
            content: JSON.stringify({
              question,
              language,
              evidence: toProviderEvidence(evidence, language),
            }),
          },
        ],
      };

      for (let attempt = 0; ; attempt += 1) {
        try {
          const completion = await client.chat.completions.create(body);
          const content = completion.choices[0]?.message?.content;
          if (typeof content !== "string") return { ok: false, classification: INVALID_OUTPUT };

          try {
            return { ok: true, output: JSON.parse(content) };
          } catch {
            return { ok: false, classification: INVALID_OUTPUT };
          }
        } catch (error) {
          const failure = classifyGroqError(error);
          if (shouldRetry(failure, attempt)) continue;
          return { ok: false, classification: classifyProviderFailure(failure) };
        }
      }
    },
  };
}
