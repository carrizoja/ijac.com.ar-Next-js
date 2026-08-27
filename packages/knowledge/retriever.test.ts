import { describe, expect, it } from "vitest";
import { retrieverFixtures } from "./fixtures/retriever";
import {
  DEFAULT_RETRIEVAL_LIMIT,
  DEFAULT_RETRIEVAL_THRESHOLD,
  normalizeQuery,
  retrieveKnowledge,
  scoreKnowledgeEntry,
} from "./retriever";

describe("lexical knowledge retrieval", () => {
  it("normalizes case, accents, punctuation, and stop words", () => {
    expect(normalizeQuery("¿Cómo está el Soporte Técnico?"))
      .toEqual(["soporte", "tecnico"]);
  });

  it("uses the declared field weights when ranking matches", () => {
    const [tagMatch, titleMatch, aliasMatch, claimMatch] = retrieverFixtures.weighted;

    expect(scoreKnowledgeEntry("network", tagMatch)).toBe(3);
    expect(scoreKnowledgeEntry("network", titleMatch)).toBe(2);
    expect(scoreKnowledgeEntry("network", aliasMatch)).toBe(2);
    expect(scoreKnowledgeEntry("network", claimMatch)).toBe(1);
    expect(retrieveKnowledge("network", retrieverFixtures.weighted).matches.map(({ entry }) => entry.id))
      .toEqual(["tag-network", "alias-network", "title-network"]);
  });

  it("retrieves multilingual aliases after diacritic normalization", () => {
    const result = retrieveKnowledge("¿Cómo contrato soporte técnico?", retrieverFixtures.multilingual);

    expect(result.matches.map(({ entry }) => entry.id)).toEqual(["managed-it-support"]);
    expect(result.matches[0]?.score).toBeGreaterThanOrEqual(DEFAULT_RETRIEVAL_THRESHOLD);
  });

  it("returns no evidence when the best score is below the threshold", () => {
    const result = retrieveKnowledge("pricing", retrieverFixtures.multilingual, { threshold: 2 });

    expect(result.matches).toEqual([]);
    expect(result.belowThreshold).toBe(true);
  });

  it("returns at most K=3 evidence entries above the threshold", () => {
    const result = retrieveKnowledge("support", retrieverFixtures.topK, { threshold: 1 });

    expect(DEFAULT_RETRIEVAL_LIMIT).toBe(3);
    expect(result.matches).toHaveLength(3);
    expect(result.matches.every(({ score }) => score >= 1)).toBe(true);
  });

  it("breaks score ties by version, freshness, and stable ID", () => {
    const result = retrieveKnowledge("consulting", retrieverFixtures.ties, { threshold: 1 });

    expect(result.matches.map(({ entry }) => entry.id)).toEqual([
      "version-two",
      "newer-review",
      "older-review",
    ]);
  });

  it("keeps close matches for an ambiguous query while bounding the result", () => {
    const result = retrieveKnowledge("cloud", retrieverFixtures.ambiguous, { threshold: 1 });

    expect(result.matches.map(({ entry }) => entry.id)).toEqual(["cloud-private", "cloud-public"]);
    expect(result.ambiguous).toBe(true);
  });

  it("fails closed for unrelated queries", () => {
    const result = retrieveKnowledge("wedding photography", retrieverFixtures.multilingual);

    expect(result.matches).toEqual([]);
    expect(result.belowThreshold).toBe(true);
    expect(result.ambiguous).toBe(false);
  });
});
