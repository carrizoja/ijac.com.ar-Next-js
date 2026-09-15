import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** Colour utilities that are invisible on a light ground unless paired. */
const DARK_ONLY = /\b(bg-black|bg-neutral-950\/80|text-white|text-neutral-[234]00|border-white\/\d+|from-neutral-900|via-neutral-9\d0|to-black)\b/;

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
  it("pairs every dark-only colour with a light counterpart", () => {
    expect(unpairedClasses(file)).toEqual([]);
  });
});
