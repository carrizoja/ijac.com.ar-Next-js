import { chatResponseSchema, type ChatResponse, type SupportedLanguage } from "../packages/contracts/chat";
import { approvedKnowledgeEntrySchema, type ApprovedKnowledgeEntry } from "../packages/knowledge/types";
import type { RetrievalMatch } from "../packages/knowledge/retriever";

const URL_PATTERN = /https?:\/\/[^\s)]+/gi;
const NUMBER_PATTERN = /\b\d+(?:[.,]\d+)?\s*(?:%|usd|eur|ars|brl|dollars?|euros?|pesos?)?\b/gi;
const NEGATION_TOKENS = new Set(["no", "not", "never", "without", "doesnt", "dont", "isnt", "cannot", "ningun", "ninguna", "no", "nao", "nunca"]);
const INJECTION_VERBS = new Set(["ignore", "disregard", "reveal", "jailbreak", "ignora", "ignorar", "revele"]);
const INJECTION_TARGETS = new Set(["instruction", "instructions", "prompt", "message", "mensagem", "instrucciones", "instrucoes"]);
const COMMON_WORDS = new Set(["and", "for", "the", "with", "from", "that", "this", "are", "can", "you", "your", "our", "per", "para", "com", "uma", "dos", "das", "los", "las", "por", "que"]);

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

function orderedTokens(value: string): string[] {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim().split(/\s+/).filter((token) => token.length > 2);
}

function evidenceText(entry: ApprovedKnowledgeEntry, language: SupportedLanguage): string {
  return [entry.title[language], ...entry.aliases[language], ...entry.tags, ...entry.claims].join(" ");
}

function hasInjectionTokens(answer: string): boolean {
  const answerTokens = tokens(answer);
  return [...answerTokens].some((token) => INJECTION_VERBS.has(token))
    && [...answerTokens].some((token) => INJECTION_TARGETS.has(token));
}

function hasRoleInversion(answer: string, entries: readonly ApprovedKnowledgeEntry[]): boolean {
  const answerTokens = orderedTokens(answer);
  const answerSubject = answerTokens.indexOf("ijac");
  if (answerSubject < 0) return false;
  return entries.some((entry) => entry.claims.some((claim) => {
    const claimTokens = orderedTokens(claim);
    const claimSubject = claimTokens.indexOf("ijac");
    const roleVerb = claimTokens[claimSubject + 1];
    const answerVerb = roleVerb ? answerTokens.indexOf(roleVerb) : -1;
    return claimSubject >= 0 && roleVerb !== undefined && answerVerb >= 0 && answerVerb < answerSubject;
  }));
}

function hasGrounding(answer: string, entries: readonly ApprovedKnowledgeEntry[], language: SupportedLanguage): boolean {
  if (hasRoleInversion(answer, entries)) return false;
  return answer.split(/[.!?]+/).map((sentence) => tokens(sentence)).filter((sentence) => sentence.size > 0)
    .every((sentence) => entries.some((entry) => {
      const known = tokens(evidenceText(entry, language));
      if ([...sentence].some((token) => NEGATION_TOKENS.has(token))) return false;
      if ([...sentence].some((token) => !known.has(token) && !COMMON_WORDS.has(token))) return false;
      return [...sentence].filter((token) => known.has(token)).length >= 2;
    }));
}

function numberValues(value: string): Set<string> {
  return new Set((value.match(NUMBER_PATTERN) ?? []).map((number) => {
    const match = number.match(/\d+(?:[.,]\d+)?/);
    return match?.[0].replace(",", ".") ?? number;
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

  if (Object.keys(output).some((key) => !["supported", "answer", "language", "sources"].includes(key))) {
    return { valid: false, response: safe };
  }
  const candidate = output as { supported?: unknown; answer?: unknown; language?: unknown; sources?: unknown };
  if (candidate.supported !== true || candidate.language !== language || typeof candidate.answer !== "string" || !candidate.answer.trim()) {
    return { valid: false, response: safe };
  }
  if (hasInjectionTokens(candidate.answer)) return { valid: false, response: safe };

  if (!Array.isArray(candidate.sources) || candidate.sources.length === 0 || candidate.sources.length > 3 || candidate.sources.some((source) => !isSafeSource(source, evidence, language))) {
    return { valid: false, response: safe };
  }
  const citedIds = new Set(candidate.sources.map((source) => (source as { id: string }).id));
  const citedEntries = evidence.filter(({ entry }) => citedIds.has(entry.id)).map(({ entry }) => entry);
  if (!hasGrounding(candidate.answer, citedEntries, language)) {
    return { valid: false, response: safe };
  }

  const answerNumbers = numberValues(candidate.answer);
  const citedNumbers = new Set(citedEntries.flatMap((entry) => [...numberValues(Object.values(entry.title).join(" ") + " " + entry.claims.join(" "))]));
  if ([...answerNumbers].some((number) => !citedNumbers.has(number)) || (answerNumbers.size > 0 && citedNumbers.size > 1)) return { valid: false, response: safe };

  const urls = candidate.answer.match(URL_PATTERN) ?? [];
  const approvedUrls = new Set(evidence.map(({ entry }) => entry.url).filter(Boolean));
  if (urls.some((url) => !approvedUrls.has(url))) return { valid: false, response: safe };

  const response = chatResponseSchema.safeParse({
    apiVersion: "v1", code: "SUCCESS", supported: true, answer: candidate.answer.trim(), language, sources: candidate.sources,
  });
  return response.success ? { valid: true, response: response.data } : { valid: false, response: safe };
}
