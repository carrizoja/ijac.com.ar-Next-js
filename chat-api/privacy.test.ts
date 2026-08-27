import { describe, expect, it } from "vitest";
import {
  TELEMETRY_TTL_SECONDS,
  buildTelemetryRecord,
  latencyBand,
  toErrorCategory,
} from "./privacy";

describe("telemetry retention", () => {
  it("expires aggregates after exactly 30 days", () => {
    expect(TELEMETRY_TTL_SECONDS).toBe(30 * 24 * 60 * 60);
  });
});

describe("telemetry record", () => {
  const input = {
    outcome: "SUCCESS" as const,
    sourceIds: ["managed-it-support"],
    language: "es" as const,
    latencyMs: 120,
    errorCategory: null,
  };

  it("keeps only the approved aggregate fields", () => {
    expect(Object.keys(buildTelemetryRecord(input)).sort()).toEqual([
      "errorCategory",
      "language",
      "latencyBand",
      "outcome",
      "sourceIds",
    ]);
  });

  it("records a latency band instead of the raw measurement", () => {
    const record = buildTelemetryRecord({ ...input, latencyMs: 1234 });
    expect(record.latencyBand).toBe("normal");
    expect(JSON.stringify(record)).not.toContain("1234");
  });

  it("drops question, answer, raw IP, and provider payload when they are supplied", () => {
    const record = buildTelemetryRecord({
      ...input,
      question: "What services do you offer?",
      answer: "iJAC provides managed IT support.",
      ip: "203.0.113.7",
      providerPayload: { choices: [{ message: { content: "secret" } }] },
      apiKey: "gsk-secret-value",
    } as Parameters<typeof buildTelemetryRecord>[0]);

    const serialized = JSON.stringify(record);
    for (const leaked of ["What services", "managed IT support", "203.0.113.7", "secret", "gsk-"]) {
      expect(serialized).not.toContain(leaked);
    }
  });

  it("keeps approved source IDs because they identify curated content, not the visitor", () => {
    expect(buildTelemetryRecord(input).sourceIds).toEqual(["managed-it-support"]);
  });

  it("records no source IDs for a failed outcome", () => {
    const record = buildTelemetryRecord({
      ...input,
      outcome: "PROVIDER_UNAVAILABLE",
      sourceIds: [],
      errorCategory: "provider_unavailable",
    });
    expect(record.sourceIds).toEqual([]);
    expect(record.outcome).toBe("PROVIDER_UNAVAILABLE");
  });
});

describe("latency bands", () => {
  it.each([
    [0, "fast"],
    [499, "fast"],
    [500, "normal"],
    [1999, "normal"],
    [2000, "slow"],
    [30000, "slow"],
  ])("maps %ims to the %s band", (ms, band) => {
    expect(latencyBand(ms)).toBe(band);
  });
});

describe("error categories", () => {
  it("reduces a thrown error to a bounded category without keeping its message", () => {
    const category = toErrorCategory(new Error("Groq responded: api_key gsk-secret-value is invalid"));
    expect(category).toBe("provider_unavailable");
    expect(category).not.toContain("gsk-secret-value");
  });

  it.each([
    ["timeout", "timeout"],
    ["rate_limited", "rate_limited"],
    ["provider_unavailable", "provider_unavailable"],
    ["invalid_output", "invalid_output"],
  ])("passes through the already-classified category %s", (input, expected) => {
    expect(toErrorCategory(input)).toBe(expected);
  });

  it("maps an unrecognized string to provider_unavailable rather than echoing it", () => {
    expect(toErrorCategory("ECONNREFUSED 10.0.0.5:443")).toBe("provider_unavailable");
  });
});
