import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Vercel transpiles each function file individually rather than bundling it, so every relative
 * import written here survives verbatim into the deployed JavaScript and must satisfy Node's
 * ESM resolver — which requires an explicit file extension. A `.js` specifier alongside a `.ts`
 * source is the standard TypeScript-for-ESM spelling: the extension describes the emitted file.
 *
 * Nothing else in this suite can catch a violation. `tsconfig.json` sets
 * `moduleResolution: "bundler"` with `noEmit`, and Vitest resolves the same way, so an
 * extensionless specifier typechecks, lints and passes every other test while failing on the
 * first production request with ERR_MODULE_NOT_FOUND. That is exactly how it reached a
 * deployment: 389 green tests, a clean typecheck, and a function that could not load.
 *
 * This checks the rule, not the whole module graph — proving the graph loads needs the real
 * transpile, which is what a deployment smoke check is for.
 */
const chatApiDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(chatApiDir, "..");

/** Source that ships. Test files and their doubles stay on Vitest's resolver. */
const shippedRoots = [chatApiDir, join(repoRoot, "packages")];

const RELATIVE_IMPORT = /\bfrom\s+"(\.\.?\/[^"]*)"/g;

function typeScriptFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return typeScriptFiles(path);
    if (!path.endsWith(".ts") || path.endsWith(".test.ts")) return [];
    return [path];
  });
}

interface Violation {
  file: string;
  specifier: string;
  problem: string;
}

function violations(): Violation[] {
  return shippedRoots.flatMap(typeScriptFiles).flatMap((file) => {
    const source = readFileSync(file, "utf8");
    return [...source.matchAll(RELATIVE_IMPORT)].flatMap(([, specifier]) => {
      const relative = file.slice(repoRoot.length + 1);

      if (!specifier.endsWith(".js")) {
        return [{ file: relative, specifier, problem: "missing the .js extension" }];
      }
      // A specifier can carry the right extension and still point nowhere after a rename.
      const target = resolve(dirname(file), `${specifier.slice(0, -3)}.ts`);
      try {
        if (statSync(target).isFile()) return [];
      } catch {
        /* falls through to the violation below */
      }
      return [{ file: relative, specifier, problem: "does not resolve to a .ts source file" }];
    });
  });
}

describe("deployed module resolution", () => {
  it("gives every relative import an explicit extension Node can resolve", () => {
    expect(violations()).toEqual([]);
  });

  it("actually inspects the shipped source, so an empty result means checked and clean", () => {
    expect(shippedRoots.flatMap(typeScriptFiles).length).toBeGreaterThan(10);
  });
});
