import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/app/globals.css", "utf-8");

function tokenIn(block: string, token: string): string {
  const start = css.indexOf(block);
  const body = css.slice(start, css.indexOf("}", start));
  // The colon matters: "--card" would otherwise match "--card-foreground".
  const match = body.match(new RegExp(`\\${token}\\s*:\\s*([^;]+);`));
  if (!match) throw new Error(`${token} not found in ${block}`);
  return match[1].trim();
}

describe("theme grounds", () => {
  it("gives light mode an off-white ground so white cards lift off it", () => {
    const background = tokenIn(":root {", "-background");
    const card = tokenIn(":root {", "-card");
    expect(background).toBe("oklch(0.985 0.003 85)");
    expect(card).toBe("oklch(1 0 0)");
    expect(background).not.toBe(card);
  });

  it("leaves the dark ground at pure black", () => {
    expect(tokenIn(".dark {", "-background")).toBe("#000000");
  });
});
