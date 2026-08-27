import type { ChatResponse, ChatResultCode, SupportedLanguage } from "../../packages/contracts/chat";
import type { RetrievalResult } from "../../packages/knowledge/retriever";
import type { ChatApiConfig } from "../config";
import { corsHeaders, preflightResponse, validateChatRequest, type RawChatRequest } from "../cors";
import { deriveClientKey, evaluateGate, type KvClient } from "../controls";
import { buildTelemetryRecord, type ErrorCategory, type TelemetryRecord } from "../privacy";
import { validateGroundedOutput } from "../validation";
import type { ChatProvider } from "../providers/groq";

/** Used only when the request failed before a language could be parsed. */
const FALLBACK_LANGUAGE: SupportedLanguage = "es";

const statusByCode: Record<ChatResultCode, number> = {
  SUCCESS: 200,
  // A safe "no approved answer" card is a normal outcome the visitor is meant to read.
  UNKNOWN: 200,
  RATE_LIMITED: 429,
  DISABLED: 503,
  PROVIDER_UNAVAILABLE: 503,
  INVALID_REQUEST: 400,
};

export interface ChatHandlerDeps {
  config: ChatApiConfig;
  kv: KvClient;
  provider: ChatProvider;
  retrieve: (query: string) => RetrievalResult;
  clientAddress: string;
}

export interface ChatHttpResponse {
  status: number;
  headers: Record<string, string>;
  body?: ChatResponse;
  telemetry?: TelemetryRecord;
}

/**
 * Single entry point for POST /v1/chat.
 *
 * Stages run in strict precedence and short-circuit: envelope, gate, retrieval, provider,
 * grounding validation. Nothing downstream of a rejection is consulted, so a disallowed
 * origin never reaches the KV store and sub-threshold retrieval never reaches the provider.
 * The handler holds no state between calls and never mutates its input.
 */
export async function handleChatRequest(
  raw: RawChatRequest,
  deps: ChatHandlerDeps,
): Promise<ChatHttpResponse> {
  const { config } = deps;

  if (raw.method === "OPTIONS") {
    const preflight = preflightResponse(raw.origin, config);
    return { status: preflight.status, headers: preflight.headers };
  }

  const startedAt = Date.now();
  const headers = corsHeaders(raw.origin, config);

  const settle = (
    code: ChatResultCode,
    language: SupportedLanguage,
    errorCategory: ErrorCategory | null,
    status = statusByCode[code],
  ): ChatHttpResponse => ({
    status,
    headers,
    body: { apiVersion: "v1", code, supported: false, language } as ChatResponse,
    telemetry: buildTelemetryRecord({
      outcome: code,
      sourceIds: [],
      language,
      latencyMs: Date.now() - startedAt,
      errorCategory,
    }),
  });

  const envelope = validateChatRequest(raw, config);
  if (!envelope.ok) {
    const category: ErrorCategory = envelope.status === 403 ? "origin_rejected" : "validation_failed";
    return settle("INVALID_REQUEST", FALLBACK_LANGUAGE, category, envelope.status);
  }

  const { question, language } = envelope.request;

  const gate = await evaluateGate({
    config,
    kv: deps.kv,
    clientKey: deriveClientKey(deps.clientAddress, config),
  });
  if (!gate.allowed) return settle(gate.code, language, gate.category);

  const retrieval = deps.retrieve(question);
  if (retrieval.belowThreshold || retrieval.matches.length === 0) {
    return settle("UNKNOWN", language, null);
  }

  const outcome = await deps.provider.complete({
    question,
    language,
    evidence: retrieval.matches,
  });
  if (!outcome.ok) {
    return settle(outcome.classification.code, language, outcome.classification.category);
  }

  const validated = validateGroundedOutput(outcome.output, retrieval.matches, language);
  if (!validated.valid) return settle("UNKNOWN", language, "invalid_output");

  return {
    status: statusByCode.SUCCESS,
    headers,
    body: validated.response,
    telemetry: buildTelemetryRecord({
      outcome: "SUCCESS",
      sourceIds: validated.response.code === "SUCCESS"
        ? (validated.response.sources ?? []).map((source) => source.id)
        : [],
      language,
      latencyMs: Date.now() - startedAt,
      errorCategory: null,
    }),
  };
}
