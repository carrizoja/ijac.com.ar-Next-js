import { describe, expect, expectTypeOf, it } from "vitest";
import {
  type ApprovedKnowledgeEntry,
  approvedKnowledgeEntrySchema,
  knowledgeEntrySchema,
  knowledgeRepositorySchema,
  isFreshKnowledgeEntry,
} from "./types";
import { approvedKnowledgeEntriesV1 } from "./fixtures/v1";

const validEntry = approvedKnowledgeEntriesV1[0];

expectTypeOf<ApprovedKnowledgeEntry["status"]>().toEqualTypeOf<"approved">();

describe("governed knowledge entries", () => {
  it("accepts versioned approved fixtures with multilingual content and approval metadata", () => {
    expect(knowledgeRepositorySchema.parse(approvedKnowledgeEntriesV1)).toEqual(
      approvedKnowledgeEntriesV1,
    );
    expect(validEntry.status).toBe("approved");
    expect(validEntry.owner).toBeTruthy();
    expect(validEntry.version).toBeGreaterThan(0);
    expect(validEntry.title).toMatchObject({ es: expect.any(String), en: expect.any(String), pt: expect.any(String) });
    expect(validEntry.aliases).toMatchObject({ es: expect.any(Array), en: expect.any(Array), pt: expect.any(Array) });
  });

  it.each([
    ["draft", { status: "draft" }],
    ["missing owner", { owner: "" }],
    ["stale", { reapprovalDueAt: "2020-01-01T00:00:00.000Z" }],
    ["invalid version", { version: 0 }],
    ["unstable ID", { id: "" }],
  ])("rejects %s entries", (_label, change) => {
    const candidate = { ...validEntry, ...change };
    expect(() => approvedKnowledgeEntrySchema.parse(candidate)).toThrow();
  });

  it("rejects unsafe or malformed canonical URLs", () => {
    for (const url of [
      "http://ijac.com.ar/services",
      "https://www.ijac.com.ar/services",
      "https://api.ijac.com.ar/services",
      "https://ijac.com.ar.evil.example/services",
      "https://user:password@ijac.com.ar/services",
      "https://ijac.com.ar:8443/services",
      "https://ijac.com.ar/services?source=chat",
      "https://ijac.com.ar/services#details",
    ]) {
      expect(() => knowledgeEntrySchema.parse({ ...validEntry, url })).toThrow();
    }
  });

  it("exposes freshness as a fail-closed approval check", () => {
    expect(isFreshKnowledgeEntry(validEntry, new Date("2026-01-01T00:00:00.000Z"))).toBe(true);
    expect(isFreshKnowledgeEntry({ ...validEntry, reapprovalDueAt: "2025-12-31T23:59:59.000Z" }, new Date("2026-01-01T00:00:00.000Z"))).toBe(false);
    expect(isFreshKnowledgeEntry({ ...validEntry, status: "draft" }, new Date("2026-01-01T00:00:00.000Z"))).toBe(false);
  });
});
