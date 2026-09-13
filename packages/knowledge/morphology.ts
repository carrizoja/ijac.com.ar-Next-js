/**
 * When two normalized terms count as the same word.
 *
 * Retrieval and grounding both need this and must not drift apart: if retrieval surfaces an
 * entry for "macbooks" that grounding then refuses to credit, the chatbot finds the answer and
 * declines to give it. One definition, used by both.
 *
 * Terms reaching here are already lowercased and stripped of accents by their caller's
 * tokenizer, so entries are compared as written.
 */

/**
 * Shortest shared prefix that lets one inflected form match another. Spanish and Portuguese
 * inflect heavily, so exact comparison rejects the same word: "reparan" and "reparam" for
 * "reparación", "atendemos" for "atiende". Six is short enough to cover those and long enough
 * to keep unrelated words apart — "reparto" shares only five with "reparación", and only five
 * with the alias "reparo".
 */
export const MIN_SHARED_PREFIX = 6;

function sharedPrefixLength(left: string, right: string): number {
  const limit = Math.min(left.length, right.length);
  let index = 0;
  while (index < limit && left[index] === right[index]) index += 1;
  return index;
}

/**
 * One term is the other plus a plural suffix. Needed because the prefix rule cannot reach short
 * words: "macs" and "macbooks" are four and eight characters against aliases of three and seven.
 * Requiring the shorter form to be a whole prefix is what stops "reparto" pairing with "reparo".
 */
function isPluralPair(left: string, right: string): boolean {
  const [longer, shorter] = left.length >= right.length ? [left, right] : [right, left];
  if (!longer.startsWith(shorter)) return false;
  const suffix = longer.slice(shorter.length);
  return suffix === "s" || suffix === "es";
}

/** Exact, a plural of the other, or a shared inflection long enough to be unambiguous. */
export function termsMatch(left: string, right: string): boolean {
  if (left === right) return true;
  if (isPluralPair(left, right)) return true;
  return left.length >= MIN_SHARED_PREFIX
    && right.length >= MIN_SHARED_PREFIX
    && sharedPrefixLength(left, right) >= MIN_SHARED_PREFIX;
}
