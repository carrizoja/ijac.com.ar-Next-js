import { chatResponseSchema, type ChatResponse, type SupportedLanguage } from "../packages/contracts/chat";
import { approvedKnowledgeEntrySchema, type ApprovedKnowledgeEntry } from "../packages/knowledge/types";
import type { RetrievalMatch } from "../packages/knowledge/retriever";

const INJECTION_PATTERN = /ignore (?:all|any|the|previous)|system prompt|developer message|jailbreak|disregard (?:the|all|your)|reveal (?:your|the) instructions/i;
const URL_PATTERN = /https?:\/\/[^\s)]+/gi;
const NUMBER_PATTERN = /\b\d+(?:[.,]\d+)?\s*(?:%|usd|eur|ars|brl|dollars?|euros?|pesos?)?\b/gi;

export interface GroundedValidation {
  valid: boolean;
  response: ChatResponse;
}

export function localizedSafeResult(language: SupportedLanguage): ChatResponse {
  return {
    apiVersion: "v1",
    code: "UNKNOWN",
    supported: false,
    language,
  };
}

function tokens(value: string): Set<string> {
  return new Set(
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ").trim().split(/\s+/).filter((token) => token.length > 2),
  );
}

function evidenceText(entry: ApprovedKnowledgeEntry, language: SupportedLanguage): string {
  return [entry.title[language], ...entry.aliases[language], ...entry.tags, ...entry.claims].join(" ");
}

function hasGrounding(answer: string, entries: readonly ApprovedKnowledgeEntry[], language: SupportedLanguage): boolean {
  return answer.split(/[.!?]+/).map((sentence) => tokens(sentence)).filter((sentence) => sentence.size > 0)
    .every((sentence) => entries.some((entry) => {
      const known = tokens(evidenceText(entry, language));
      return [...sentence].filter((token) => known.has(token)).length >= 2;
    }));
}

function isSafeSource(source: unknown, evidence: readonly RetrievalMatch[], language: SupportedLanguage): boolean {
  if (!source || typeof source !== "object") return false;
  const candidate = source as { id?: unknown; title?: unknown; url?: unknown };
  const match = evidence.find(({ entry }) => entry.id === candidate.id);
  if (!match || candidate.title !== match.entry.title[language]) return false;
  const parsed = approvedKnowledgeEntrySchema.safeParse(match.entry);
  if (!parsed.success) return false;
  if (candidate.url !== undefined && candidate.url !== match.entry.url) return false;
  return true;
}

export function validateGroundedOutput(
  output: unknown,
  evidence: readonly RetrievalMatch[],
  language: SupportedLanguage,
): GroundedValidation {
  const safe = localizedSafeResult(language);
  if (!Array.isArray(evidence) || evidence.length === 0 || !output || typeof output !== "object") {
    return { valid: false, response: safe };
  }

  const candidate = output as { supported?: unknown; answer?: unknown; language?: unknown; sources?: unknown };
  if (candidate.supported !== true || candidate.language !== language || typeof candidate.answer !== "string" || !candidate.answer.trim()) {
    return { valid: false, response: safe };
  }
  if (INJECTION_PATTERN.test(candidate.answer) || !hasGrounding(candidate.answer, evidence.map(({ entry }) => entry), language)) {
    return { valid: false, response: safe };
  }

  const allEvidenceText = evidence.map(({ entry }) => Object.values(entry.title).join(" ") + " " + entry.claims.join(" ")).join(" ");
  const unsupportedNumbers = candidate.answer.match(NUMBER_PATTERN)?.some((number) => !allEvidenceText.includes(number)) ?? false;
  if (unsupportedNumbers) return { valid: false, response: safe };

  const urls = candidate.answer.match(URL_PATTERN) ?? [];
  const approvedUrls = new Set(evidence.map(({ entry }) => entry.url).filter(Boolean));
  if (urls.some((url) => !approvedUrls.has(url))) return { valid: false, response: safe };

  if (!Array.isArray(candidate.sources) || candidate.sources.length === 0 || candidate.sources.length > 3 || candidate.sources.some((source) => !isSafeSource(source, evidence, language))) {
    return { valid: false, response: safe };
  }

  const response = chatResponseSchema.safeParse({
    apiVersion: "v1", code: "SUCCESS", supported: true, answer: candidate.answer.trim(), language, sources: candidate.sources,
  });
  return response.success ? { valid: true, response: response.data } : { valid: false, response: safe };
}
