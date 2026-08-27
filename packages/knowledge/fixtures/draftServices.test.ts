import { describe, expect, it } from "vitest";
import { draftServiceEntries } from "./draftServices";
import { approvedKnowledgeEntrySchema, knowledgeEntrySchema } from "../types";
import { retrieveKnowledge } from "../retriever";

describe("draft service knowledge", () => {
  it("covers every service on the site", () => {
    expect(draftServiceEntries).toHaveLength(8);
  });

  it("is structurally valid against the knowledge schema", () => {
    for (const entry of draftServiceEntries) {
      expect(() => knowledgeEntrySchema.parse(entry), entry.id).not.toThrow();
    }
  });

  it("is entirely unapproved, so nothing can reach visitors before sign-off", () => {
    for (const entry of draftServiceEntries) {
      expect(entry.status, entry.id).toBe("draft");
      expect(approvedKnowledgeEntrySchema.safeParse(entry).success, entry.id).toBe(false);
    }
  });

  it("uses stable unique ids", () => {
    const ids = draftServiceEntries.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("points every source at a canonical service page", () => {
    for (const entry of draftServiceEntries) {
      expect(entry.url, entry.id).toBe(`https://ijac.com.ar/services/${entry.id}`);
    }
  });

  it("carries claims in all three languages so answers can be grounded in each", () => {
    for (const entry of draftServiceEntries) {
      expect(entry.claims.length, entry.id).toBeGreaterThanOrEqual(3);
      expect(entry.title.es && entry.title.en && entry.title.pt, entry.id).toBeTruthy();
      expect(entry.aliases.es.length && entry.aliases.en.length && entry.aliases.pt.length, entry.id)
        .toBeTruthy();
    }
  });

  it("states no price, percentage, or timeframe that the site does not publish", () => {
    for (const entry of draftServiceEntries) {
      for (const claim of entry.claims) {
        expect(claim, `${entry.id}: ${claim}`).not.toMatch(/\d/);
      }
    }
  });

  it("carries a guardrail telling the model not to invent commercial terms", () => {
    for (const entry of draftServiceEntries) {
      expect(entry.validationRules?.length, entry.id).toBeGreaterThan(0);
    }
  });

  it("is not wired into the served knowledge set", async () => {
    const app = await import("../../../chat-api/app");
    expect(String(app.createChatApp)).not.toContain("draftServiceEntries");
  });
});

/**
 * The reason this set exists: a single-entry knowledge base falls below the retrieval
 * threshold for essentially every real question, so the chatbot hands off every time.
 * These cases pin that the drafted set actually answers, in all three languages.
 */
describe("draft knowledge retrieval coverage", () => {
  const promoted = draftServiceEntries.map((entry) => ({ ...entry, status: "approved" as const }));

  it.each([
    ["¿Instalan redes WiFi en oficinas?", "redes-wifi-cableado"],
    ["Necesito proteger los datos de mi empresa", "ciberseguridad-proteccion-datos"],
    ["Do you build custom gaming PCs?", "armado-pcs-hardware"],
    ["Can you fix my MacBook?", "soporte-tecnico-pc-mac-apple"],
    ["Vocês desenvolvem aplicativos móveis?", "desarrollo-web-apps"],
    ["¿Hacen diseño de interfaces?", "diseno-ux-ui"],
    ["Do you do data analysis and AI?", "data-science-inteligencia-artificial"],
    ["Quiero rediseñar la identidad de mi marca", "branding-marketing-digital"],
  ])("retrieves %s as %s", (question, expectedId) => {
    const result = retrieveKnowledge(question, promoted);

    expect(result.belowThreshold, question).toBe(false);
    expect(result.matches[0].entry.id, question).toBe(expectedId);
  });

  it("still returns nothing for a question the site does not cover", () => {
    expect(retrieveKnowledge("¿Quién ganó el mundial de 1998?", promoted).belowThreshold).toBe(true);
  });
});
