import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Colour utilities that only read on a dark ground, so they need a light
 * counterpart on any surface that follows the theme.
 *
 * Anchored at both ends, with an optional `/alpha` suffix, and allowing a
 * leading variant (`hover:`) so `hover:text-emerald-200` is checked too.
 *
 * `bg-white` and `border-white` are listed only in their translucent form:
 * an opaque `bg-white` is the light-mode card ground, not a dark-only class,
 * and it is paired with `dark:bg-neutral-950/80` rather than `dark:bg-white`.
 */
const DARK_ONLY = new RegExp(
  "(?:^|:)(?:" +
    [
      "(?:bg-black" +
        "|bg-neutral-(?:800|900|950)" +
        "|text-white" +
        "|text-neutral-[234]00" +
        "|text-emerald-[123]00" +
        "|from-black" +
        "|from-neutral-900" +
        "|via-neutral-9[05]0" +
        "|to-black" +
        ")(?:/\\S+)?",
      "(?:bg-white|border-white)/\\S+",
    ].join("|") +
    ")$",
);

/**
 * Text rendered directly over the photo scrim in the services pages
 * (`bg-gradient-to-t from-black via-black/45 to-transparent`, e.g.
 * `src/app/(es)/services/page.tsx:122`) is exempt from pairing. That scrim is
 * not part of the light/dark mapping table and stays dark in both themes, so
 * a "light-mode" colour on top of it would render dark-on-dark instead of
 * light-on-dark. The elements affected are the scrim itself, the service-card
 * caption heading and its hover colour, the caption eyebrow, and the caption
 * paragraph.
 */
const SCRIM_CAPTION_EXEMPTIONS: Record<string, string[]> = {
  "src/app/(es)/services/page.tsx": [
    "from-black",
    "text-emerald-300",
    "text-white",
    "hover:text-emerald-200",
    "text-neutral-200",
  ],
  "src/app/en/services/page.tsx": [
    "from-black",
    "text-emerald-300",
    "text-white",
    "hover:text-emerald-200",
    "text-neutral-200",
  ],
  "src/app/(es)/services/[slug]/page.tsx": ["from-black"],
  "src/app/en/services/[slug]/page.tsx": ["from-black"],
};

/**
 * Elements that paint their own opaque dark ground and put their foreground
 * on *that* ground rather than on the page's. Pairing them would break them:
 * a light-mode text colour inside `PrimaryButton`'s black pill would render
 * dark-on-black. The pill is a brand element that stays dark in both themes,
 * like the emerald CTA, so `bg-black` and the `text-white` co-declared with
 * it in the same class string are exempt.
 */
const OWN_DARK_SURFACE_EXEMPTIONS: Record<string, string[]> = {
  "src/app/components/ui/PrimaryButton.tsx": ["bg-black", "text-white"],
};

/**
 * `className={someIdentifier}` hides the class list in a const declaration —
 * which is exactly where `SecondaryButton` kept its unpaired `text-white`.
 * Resolve the identifier to that declaration's initializer instead of
 * skipping it, and throw if it cannot be found: a class list the guard
 * cannot read must fail loudly, never pass quietly.
 */
function resolveIdentifier(source: string, name: string, file: string): string {
  const declaration = new RegExp(`const\\s+${name}\\s*=\\s*([^;]*);`).exec(source);

  if (!declaration) {
    throw new Error(
      `className={${name}} in ${file} resolves to no const in the same file, ` +
        `so its classes cannot be checked.`,
    );
  }

  return declaration[1];
}

/**
 * Every `className` value in the file, including `className={...}`
 * expressions. Template literals are scanned for their static text; the
 * `${...}` holes are left as-is and simply never match a colour utility.
 * Interpolated maps (`sizeClasses[variant]`) are therefore invisible here —
 * they hold spacing, not colour.
 *
 * A `className={...}` whose braces do not balance is thrown on rather than
 * skipped: silently passing over an expression is how an unpaired colour
 * slips through the guard.
 */
function classNameValues(source: string, file: string): string[] {
  const values: string[] = [];

  for (const match of source.matchAll(/className=(?:"([^"]*)"|\{)/g)) {
    if (match[1] !== undefined) {
      values.push(match[1]);
      continue;
    }

    const start = match.index + match[0].length;
    let depth = 1;
    let index = start;

    while (index < source.length && depth > 0) {
      if (source[index] === "{") depth += 1;
      else if (source[index] === "}") depth -= 1;
      index += 1;
    }

    if (depth !== 0) {
      throw new Error(`Unbalanced className={...} expression in ${file}`);
    }

    const expression = source.slice(start, index - 1).trim();

    values.push(
      /^[A-Za-z_$][\w$]*$/.test(expression)
        ? resolveIdentifier(source, expression, file)
        : expression,
    );
  }

  return values;
}

function unpairedClasses(file: string): string[] {
  const source = readFileSync(file, "utf-8");
  const offenders: string[] = [];

  for (const value of classNameValues(source, file)) {
    for (const token of value.replace(/[`'"]/g, " ").split(/\s+/)) {
      // A dark: variant is the light-mode counterpart, not an offender.
      if (token.startsWith("dark:")) continue;
      if (!DARK_ONLY.test(token)) continue;
      if (value.includes(`dark:${token}`)) continue;
      offenders.push(token);
    }
  }

  return offenders;
}

/**
 * The services pages plus the shared components they render. Scanning only
 * the pages is what let an unpaired `SecondaryButton` reach a light page.
 */
describe.each([
  "src/app/(es)/services/page.tsx",
  "src/app/en/services/page.tsx",
  "src/app/(es)/services/[slug]/page.tsx",
  "src/app/en/services/[slug]/page.tsx",
  "src/app/components/Breadcrumbs.tsx",
  "src/app/components/ui/PrimaryButton.tsx",
  "src/app/components/ui/SecondaryButton.tsx",
])("%s", (file) => {
  it("pairs every dark-only colour with a light counterpart, except the documented exemptions", () => {
    const expected = [
      ...(SCRIM_CAPTION_EXEMPTIONS[file] ?? []),
      ...(OWN_DARK_SURFACE_EXEMPTIONS[file] ?? []),
    ];
    expect(unpairedClasses(file)).toEqual(expected);
  });
});
