import { chatRequestSchema, type ChatRequest, type ChatResultCode } from "../packages/contracts/chat";
import type { ChatApiConfig } from "./config";

export interface RawChatRequest {
  method: string;
  origin: string | null;
  contentType: string | null;
  body: string;
}

export type ChatRequestValidation =
  | { ok: true; request: ChatRequest }
  | { ok: false; code: ChatResultCode; status: number };

export interface PreflightResponse {
  status: number;
  headers: Record<string, string>;
}

function isAllowedOrigin(origin: string | null, config: ChatApiConfig): origin is string {
  return origin !== null && config.allowedOrigins.includes(origin);
}

function isJsonContentType(contentType: string | null): boolean {
  if (contentType === null) return false;
  return contentType.split(";")[0].trim().toLowerCase() === "application/json";
}

function reject(status: number): ChatRequestValidation {
  return { ok: false, code: "INVALID_REQUEST", status };
}

/**
 * Validates the HTTP envelope and the request contract in one pass.
 * Rejection carries only a status and a result code — never parser text or echoed input.
 */
export function validateChatRequest(raw: RawChatRequest, config: ChatApiConfig): ChatRequestValidation {
  if (raw.method !== "POST") return reject(405);
  if (!isAllowedOrigin(raw.origin, config)) return reject(403);
  if (!isJsonContentType(raw.contentType)) return reject(415);
  if (new TextEncoder().encode(raw.body).length > config.maxRequestBytes) return reject(413);

  let payload: unknown;
  try {
    payload = JSON.parse(raw.body);
  } catch {
    return reject(400);
  }

  const parsed = chatRequestSchema.safeParse(payload);
  return parsed.success ? { ok: true, request: parsed.data } : reject(400);
}

/** Always echoes one exact configured origin. A wildcard is never emitted. */
export function corsHeaders(origin: string | null, config: ChatApiConfig): Record<string, string> {
  const headers: Record<string, string> = { Vary: "Origin" };
  if (isAllowedOrigin(origin, config)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

export function preflightResponse(origin: string | null, config: ChatApiConfig): PreflightResponse {
  if (!isAllowedOrigin(origin, config)) {
    return { status: 403, headers: { Vary: "Origin" } };
  }
  return {
    status: 204,
    headers: {
      ...corsHeaders(origin, config),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  };
}
