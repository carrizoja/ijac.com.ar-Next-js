import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const appDirectory = fileURLToPath(new URL(".", import.meta.url));
const projectDirectory = fileURLToPath(new URL("../..", import.meta.url));

function readAppFile(path: string) {
  return readFileSync(`${appDirectory}${path}`, "utf8");
}

describe("locale root layout structure", () => {
  it("uses separate locale roots backed by one shared document shell", () => {
    expect(existsSync(`${appDirectory}layout.tsx`)).toBe(false);
    expect(readAppFile("(es)/layout.tsx")).toContain('locale="es"');
    expect(readAppFile("en/layout.tsx")).toContain('locale="en"');
    expect(readAppFile("components/SiteDocument.tsx")).toContain("<html lang={locale}");
  });

  it("keeps Spanish routes URL-neutral and metadata routes at the app root", () => {
    expect(existsSync(`${appDirectory}(es)/page.tsx`)).toBe(true);
    expect(existsSync(`${appDirectory}(es)/contact/page.tsx`)).toBe(true);
    expect(existsSync(`${appDirectory}(es)/services/[slug]/page.tsx`)).toBe(true);
    expect(existsSync(`${appDirectory}sitemap.ts`)).toBe(true);
    expect(existsSync(`${appDirectory}robots.ts`)).toBe(true);
  });

  it("provides a complete global not-found document for multiple root layouts", () => {
    expect(readAppFile("global-not-found.tsx")).toContain("<SiteDocument");
    expect(readFileSync(`${projectDirectory}/next.config.ts`, "utf8")).toContain(
      "globalNotFound: true",
    );
  });
});
