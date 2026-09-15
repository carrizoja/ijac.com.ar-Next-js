import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** Colour utilities that are invisible on a light ground unless paired. */
const DARK_ONLY = /\b(bg-black|bg-neutral-950\/80|text-white|text-neutral-[234]00|border-white\/\d+|from-neutral-900|via-neutral-9\d0|to-black)\b/;

/**
 * Text rendered directly over the photo scrim in the services-listing cards
 * (`bg-gradient-to-t from-black via-black/45 to-transparent`, e.g.
 * `src/app/(es)/services/page.tsx:122`) is exempt from pairing. That scrim is
 * not part of the light/dark mapping table and stays dark in both themes, so
 * a "light-mode" text colour on top of it would render dark-on-dark instead
 * of light-on-dark. The two elements affected are the service-card caption
 * heading (`text-white`) and caption paragraph (`text-neutral-200`) inside
 * each services-listing page.
 *
 * Each file below lists the *exact* unpaired tokens its caption elements are
 * expected to still carry, in the order `unpairedClasses` finds them. This is
 * a named allowlist per file, not a pattern match, so any other, unrelated
 * unpaired class in the file still fails the test instead of slipping through
 * this exemption.
 */
const SCRIM_CAPTION_EXEMPTIONS: Record<string, string[]> = {
  "src/app/(es)/services/page.tsx": ["text-white", "text-neutral-200"],
  "src/app/en/services/page.tsx": ["text-white", "text-neutral-200"],
};

function unpairedClasses(file: string): string[] {
  const source = readFileSync(file, "utf-8");
  const offenders: string[] = [];
  for (const match of source.matchAll(/className="([^"]*)"/g)) {
    const value = match[1];
    for (const token of value.split(/\s+/)) {
      // A dark: variant is the light-mode counterpart, not an offender.
      if (token.startsWith("dark:")) continue;
      if (!DARK_ONLY.test(token)) continue;
      if (value.includes(`dark:${token}`)) continue;
      offenders.push(token);
    }
  }
  return offenders;
}

describe.each([
  "src/app/(es)/services/page.tsx",
  "src/app/en/services/page.tsx",
  "src/app/(es)/services/[slug]/page.tsx",
  "src/app/en/services/[slug]/page.tsx",
])("%s", (file) => {
  it("pairs every dark-only colour with a light counterpart, except the documented scrim-caption exemptions", () => {
    const expectedExemptions = SCRIM_CAPTION_EXEMPTIONS[file] ?? [];
    expect(unpairedClasses(file)).toEqual(expectedExemptions);
  });
});
