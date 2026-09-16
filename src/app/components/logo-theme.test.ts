import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * The brand logo ships as two assets:
 *
 *   public/ijac-logo.png      white artwork  (luminance 254/255) — for dark grounds
 *   public/logo_ijac_pos.png  dark artwork   (luminance  95/255) — for light grounds
 *
 * Rendering only the white one on a surface that goes light in light mode makes
 * the logo disappear. The className pairing guard in services-theme.test.ts
 * cannot catch this: the colour lives in an image, not in a class.
 */

const WHITE_LOGO = "/ijac-logo.png";
const DARK_LOGO = "/logo_ijac_pos.png";

/** Components whose logo sits on a surface that goes light in light mode. */
const THEMEABLE_LOGO_FILES = [
  "src/app/components/Navbarijac.tsx",
  "src/app/components/HamburgerMenu.tsx",
  "src/app/components/Hero.tsx",
];

/**
 * Exempt by name, with the reason — never a blanket skip.
 *
 * Footer sits in a permanently dark band (`from-slate-900 via-purple-900`) that
 * stays dark in both themes by product decision, so the white logo is correct
 * there and a dark counterpart would be wrong.
 */
const PERMANENTLY_DARK_SURFACES: Record<string, string> = {
  "src/app/components/Footer.tsx": "footer band stays dark in both themes",
};

function source(file: string): string {
  return readFileSync(file, "utf-8");
}

describe.each(THEMEABLE_LOGO_FILES)("%s", (file) => {
  it("renders both logo artworks", () => {
    const text = source(file);

    expect(text).toContain(WHITE_LOGO);
    expect(text).toContain(DARK_LOGO);
  });

  it("shows the dark artwork in light mode and the white one in dark mode", () => {
    const text = source(file);

    // The element carrying the white logo must be hidden until dark mode.
    const whiteBlock = text.slice(text.indexOf(WHITE_LOGO));
    expect(whiteBlock).toMatch(/hidden[^"]*dark:block/);

    // The element carrying the dark logo must be hidden once dark mode applies.
    const darkBlock = text.slice(text.indexOf(DARK_LOGO));
    expect(darkBlock).toMatch(/dark:hidden/);
  });
});

describe("permanently dark surfaces", () => {
  it.each(Object.entries(PERMANENTLY_DARK_SURFACES))(
    "%s keeps the white logo unpaired (%s)",
    (file) => {
      const text = source(file);

      expect(text).toContain(WHITE_LOGO);
      expect(text).not.toContain(DARK_LOGO);
    },
  );
});
