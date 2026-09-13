import { describe, expect, it } from "vitest";
import { termsMatch } from "./morphology";

/**
 * Retrieval and grounding both decide "same word" here, so the boundary is pinned from both
 * sides directly. Reaching it only through those callers hides failures: a term the rule stops
 * matching can still be carried by retrieval's score threshold or grounding's tolerance for a
 * stray word, and the test passes while the rule is broken.
 */
describe("term matching", () => {
  it.each([
    ["soporte", "soporte", "identical terms"],
    ["macs", "mac", "a plural formed with s"],
    ["pcs", "pc", "a plural of a two letter term"],
    ["redes", "red", "a plural formed with es"],
    ["macbooks", "macbook", "a plural of a long term"],
    ["reparan", "reparacion", "a Spanish conjugation sharing six characters"],
    ["reparam", "reparacion", "a Portuguese conjugation sharing six characters"],
  ])("matches %s with %s: %s", (left, right) => {
    expect(termsMatch(left, right)).toBe(true);
    expect(termsMatch(right, left)).toBe(true);
  });

  it.each([
    ["reparto", "reparacion", "shares only five characters"],
    ["reparto", "reparo", "shares only five, and is not a plural"],
    ["maca", "mac", "extends the term by a suffix that is not a plural"],
    ["macho", "mac", "extends the term by two characters that are not a plural"],
    ["caso", "casa", "two short words that merely resemble each other"],
    ["red", "web", "unrelated short terms"],
  ])("refuses %s against %s: %s", (left, right) => {
    expect(termsMatch(left, right)).toBe(false);
    expect(termsMatch(right, left)).toBe(false);
  });
});
