import type { ChatResultCode, SupportedLanguage } from "../packages/contracts/chat";

/** Approved aggregates expire 30 days after they are written. */
export const TELEMETRY_TTL_SECONDS = 30 * 24 * 60 * 60;

export const errorCategories = [
  "timeout",
  "rate_limited",
  "provider_unavailable",
  "invalid_output",
  "origin_rejected",
  "validation_failed",
  "quota_exceeded",
  "kill_switch",
  "disabled",
] as const;

export type ErrorCategory = (typeof errorCategories)[number];
export type LatencyBand = "fast" | "normal" | "slow";

export interface TelemetryInput {
  outcome: ChatResultCode;
  sourceIds: readonly string[];
  language: SupportedLanguage;
  latencyMs: number;
  errorCategory: ErrorCategory | null;
}

export interface TelemetryRecord {
  outcome: ChatResultCode;
  sourceIds: string[];
  language: SupportedLanguage;
  latencyBand: LatencyBand;
  errorCategory: ErrorCategory | null;
}

export function latencyBand(latencyMs: number): LatencyBand {
  if (latencyMs < 500) return "fast";
  if (latencyMs < 2000) return "normal";
  return "slow";
}

/**
 * Reduces anything thrown or reported to a bounded category.
 * Messages are never inspected for content, so provider payloads and secrets cannot survive here.
 */
export function toErrorCategory(error: unknown): ErrorCategory {
  if (typeof error === "string" && (errorCategories as readonly string[]).includes(error)) {
    return error as ErrorCategory;
  }
  return "provider_unavailable";
}

/**
 * Builds the only record shape that may be persisted.
 * Fields are copied explicitly, so any extra key on the input is dropped rather than spread through.
 */
export function buildTelemetryRecord(input: TelemetryInput): TelemetryRecord {
  return {
    outcome: input.outcome,
    sourceIds: [...input.sourceIds],
    language: input.language,
    latencyBand: latencyBand(input.latencyMs),
    errorCategory: input.errorCategory,
  };
}
