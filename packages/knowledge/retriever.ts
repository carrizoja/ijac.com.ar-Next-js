import { approvedKnowledgeEntrySchema, type ApprovedKnowledgeEntry, type KnowledgeEntry } from "./types";

export const DEFAULT_RETRIEVAL_LIMIT = 3;
export const DEFAULT_RETRIEVAL_THRESHOLD = 2;

const FIELD_WEIGHTS = {
  tags: 3,
  title: 2,
  aliases: 2,
  claims: 1,
} as const;

const STOP_WORDS = new Set([
  "a", "an", "and", "as", "at", "com", "como", "de", "do", "el", "en", "esta", "for", "how", "la", "las", "los",
  "of", "o", "os", "para", "por", "que", "the", "un", "una", "what", "with",
]);

function tokenize(value: string): string[] {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

export function normalizeQuery(query: string): string[] {
  return tokenize(query);
}

function countMatchingTerms(queryTerms: string[], values: readonly (string | readonly string[])[]): number {
  const valueTerms = values.flatMap((value) => typeof value === "string" ? tokenize(value) : value.flatMap(tokenize));
  return queryTerms.reduce(
    (total, term) => total + valueTerms.filter((valueTerm) => valueTerm === term).length,
    0,
  );
}

export function scoreKnowledgeEntry(query: string, entry: ApprovedKnowledgeEntry): number {
  const queryTerms = normalizeQuery(query);
  if (queryTerms.length === 0) return 0;

  return (
    countMatchingTerms(queryTerms, entry.tags) * FIELD_WEIGHTS.tags
    + countMatchingTerms(queryTerms, Object.values(entry.title)) * FIELD_WEIGHTS.title
    + countMatchingTerms(queryTerms, Object.values(entry.aliases)) * FIELD_WEIGHTS.aliases
    + countMatchingTerms(queryTerms, entry.claims) * FIELD_WEIGHTS.claims
  );
}

export interface RetrievalMatch {
  entry: ApprovedKnowledgeEntry;
  score: number;
}

export interface RetrievalOptions {
  limit?: number;
  threshold?: number;
}

export interface RetrievalResult {
  matches: RetrievalMatch[];
  belowThreshold: boolean;
  ambiguous: boolean;
}

function compareMatches(left: RetrievalMatch, right: RetrievalMatch): number {
  return right.score - left.score
    || right.entry.version - left.entry.version
    || Date.parse(right.entry.reviewedAt) - Date.parse(left.entry.reviewedAt)
    || Date.parse(right.entry.approvedAt) - Date.parse(left.entry.approvedAt)
    || (left.entry.id < right.entry.id ? -1 : left.entry.id > right.entry.id ? 1 : 0);
}

export function retrieveKnowledge(
  query: string,
  entries: readonly KnowledgeEntry[],
  options: RetrievalOptions = {},
): RetrievalResult {
  const requestedLimit = options.limit ?? DEFAULT_RETRIEVAL_LIMIT;
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(DEFAULT_RETRIEVAL_LIMIT, Math.max(0, Math.floor(requestedLimit)))
    : 0;
  const threshold = options.threshold ?? DEFAULT_RETRIEVAL_THRESHOLD;
  if (!Number.isFinite(threshold) || threshold <= 0) {
    return { matches: [], belowThreshold: true, ambiguous: false };
  }

  const ranked = entries
    .map((entry) => approvedKnowledgeEntrySchema.safeParse(entry))
    .filter((result): result is { success: true; data: ApprovedKnowledgeEntry } => result.success)
    .map(({ data: entry }) => ({ entry, score: scoreKnowledgeEntry(query, entry) }))
    .filter(({ score }) => score >= threshold)
    .sort(compareMatches);
  const matches = ranked.slice(0, limit);
  const ambiguous = matches.length > 1 && matches[0].score - matches[1].score <= 1;

  return {
    matches,
    belowThreshold: ranked.length === 0,
    ambiguous,
  };
}

export function createKnowledgeRetriever(
  entries: readonly KnowledgeEntry[],
  options: RetrievalOptions = {},
): (query: string) => RetrievalResult {
  return (query) => retrieveKnowledge(query, entries, options);
}
