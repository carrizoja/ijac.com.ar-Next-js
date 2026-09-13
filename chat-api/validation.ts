import { chatResponseSchema, type ChatResponse, type SupportedLanguage } from "../packages/contracts/chat.js";
import { approvedKnowledgeEntrySchema, type ApprovedKnowledgeEntry } from "../packages/knowledge/types.js";
import { termsMatch } from "../packages/knowledge/morphology.js";
import type { RetrievalMatch } from "../packages/knowledge/retriever.js";

const URL_PATTERN = /https?:\/\/[^\s)]+/gi;
const NUMBER_PATTERN = /\b\d+(?:[.,]\d+)?\s*(?:%|usd|eur|ars|brl|dollars?|euros?|pesos?)?\b/gi;
const NEGATION_TOKENS = new Set(["no", "not", "never", "without", "doesnt", "dont", "isnt", "cannot", "ningun", "ninguna", "no", "nao", "nunca"]);
const INJECTION_VERBS = new Set(["ignore", "disregard", "reveal", "jailbreak", "ignora", "ignorar", "revele"]);
const INJECTION_TARGETS = new Set(["instruction", "instructions", "prompt", "message", "mensagem", "instrucciones", "instrucoes"]);
/**
 * Function words that carry no claim about the business: connectives, prepositions, articles,
 * pronouns and copulas across the three supported languages. Tokens are compared after accent
 * stripping, so entries are written unaccented. Quantifiers ("todos", "cada", "siempre") are
 * deliberately absent — they would let an answer widen a claim the evidence never made.
 */
const COMMON_WORDS = new Set([
  // English
  "and", "for", "the", "with", "from", "that", "this", "are", "can", "you", "your", "our", "per",
  "also", "including", "such", "while", "when", "where", "about", "between", "into", "than",
  "then", "they", "these", "those", "been", "have", "has", "its", "but",
  // Spanish
  "para", "los", "las", "por", "que", "como", "asi", "incluyendo", "ademas", "tambien", "pero",
  "sino", "aunque", "cuando", "donde", "sobre", "entre", "desde", "hasta", "ante", "tras",
  "segun", "mediante", "durante", "una", "unos", "unas", "del", "ellos", "ellas", "esta", "este",
  "estos", "estas", "esa", "ese", "son", "ser",
  // Portuguese
  "com", "uma", "dos", "das", "assim", "incluindo", "alem", "mas", "porem", "quando", "onde",
  "ate", "seus", "suas", "estes", "sao",
  // Affirmations. They answer the question without saying anything about the business, and a
  // model asked a yes/no question opens with one almost every time.
  "yes", "sim", "claro",
]);

/**
 * Words that create a commitment: a price, a guarantee, or a quantifier that widens a claim
 * beyond what the evidence supports. Unlike ordinary vocabulary these are never tolerated as
 * an unsupported token, however well grounded the rest of the sentence is — a fluent answer
 * with one invented word here is exactly the expensive failure.
 *
 * Only checked against tokens the evidence does NOT contain, so an entry that genuinely states
 * a price or a warranty can still have it repeated back.
 */
const RISK_WORDS = new Set([
  // Price
  "gratis", "gratuito", "gratuita", "gratuitos", "gratuitas", "free", "sincargo",
  "precio", "precios", "preco", "precos", "price", "prices", "costo", "costos", "custo",
  "custos", "cost", "costs", "tarifa", "tarifas", "fee", "fees", "descuento", "descuentos",
  "desconto", "descontos", "discount", "promocion", "promocao", "promotion", "oferta",
  // Commitments
  "garantia", "garantias", "guarantee", "guaranteed", "warranty", "certificado", "certificada",
  "certified", "oficial", "official", "autorizado", "autorizada", "authorized",
  "inmediato", "inmediata", "imediato", "imediata", "immediate", "instantaneo", "instant",
  // Quantifiers, which widen a claim the evidence never made
  "todos", "todas", "todo", "toda", "all", "every", "siempre", "sempre", "always",
  "cualquier", "qualquer", "any", "ilimitado", "ilimitada", "unlimited", "cualquiera",
]);

/**
 * How much of a sentence may be unsupported vocabulary. A model paraphrases — it writes
 * "ofrece" where the evidence says "brinda" — and demanding that every content word appear in
 * the evidence rejects accurate answers outright. Both bounds apply: a short sentence cannot
 * spend its whole budget on one invented word, and a long one cannot accumulate several.
 */
const MAX_UNSUPPORTED_SHARE = 0.2;
const MAX_UNSUPPORTED_TOKENS = 2;

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

/**
 * Shares its rule with retrieval, so a word that surfaced an entry is also credited when the
 * answer is checked against it. Drifting apart would let the chatbot find an answer and then
 * refuse to give it.
 */
function isKnownToken(token: string, known: ReadonlySet<string>): boolean {
  if (known.has(token)) return true;
  for (const candidate of known) {
    if (termsMatch(token, candidate)) return true;
  }
  return false;
}

function hasGrounding(answer: string, entries: readonly ApprovedKnowledgeEntry[], language: SupportedLanguage): boolean {
  if (hasRoleInversion(answer, entries)) return false;
  return answer.split(/[.!?]+/).map((sentence) => tokens(sentence)).filter((sentence) => sentence.size > 0)
    .every((sentence) => entries.some((entry) => {
      const known = tokens(evidenceText(entry, language));
      if ([...sentence].some((token) => NEGATION_TOKENS.has(token))) return false;

      const unsupported = [...sentence].filter(
        (token) => !isKnownToken(token, known) && !COMMON_WORDS.has(token),
      );
      // Tolerance covers vocabulary, never substance: one invented price outweighs any amount
      // of surrounding evidence, so a claim-bearing word fails the sentence on its own.
      if (unsupported.some((token) => RISK_WORDS.has(token))) return false;
      if (unsupported.length > MAX_UNSUPPORTED_TOKENS) return false;
      // Strictly under the share, so a short sentence cannot spend its whole budget on one
      // invented word: "iJAC atiende el reparto de equipos Mac" is four known tokens and a
      // different service. A sentence must reach six tokens before it can afford any.
      if (unsupported.length >= sentence.size * MAX_UNSUPPORTED_SHARE) return false;
      return [...sentence].filter((token) => isKnownToken(token, known)).length >= 2;
    }));
}

function numberValues(value: string): Set<string> {
  return new Set((value.match(NUMBER_PATTERN) ?? []).map((number) => {
    const match = number.match(/\d+(?:[.,]\d+)?/);
    return match?.[0].replace(",", ".") ?? number;
  }));
}

/**
 * A citation carries an id and nothing else. The model is not asked for a title or url, so a
 * source bearing extra fields has gone off-contract and the whole answer is discarded.
 */
function isSafeSource(source: unknown, evidence: readonly RetrievalMatch[]): boolean {
  if (!source || typeof source !== "object") return false;
  if (Object.keys(source).some((key) => key !== "id")) return false;
  const { id } = source as { id?: unknown };
  const match = evidence.find(({ entry }) => entry.id === id);
  if (!match) return false;
  return approvedKnowledgeEntrySchema.safeParse(match.entry).success;
}

/** Source metadata comes from the approved entry, never from the model. */
function toResponseSources(entries: readonly ApprovedKnowledgeEntry[], language: SupportedLanguage) {
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.title[language],
    ...(entry.url ? { url: entry.url } : {}),
  }));
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

  if (!Array.isArray(candidate.sources) || candidate.sources.length === 0 || candidate.sources.length > 3 || candidate.sources.some((source) => !isSafeSource(source, evidence))) {
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
    apiVersion: "v1", code: "SUCCESS", supported: true, answer: candidate.answer.trim(), language, sources: toResponseSources(citedEntries, language),
  });
  return response.success ? { valid: true, response: response.data } : { valid: false, response: safe };
}
