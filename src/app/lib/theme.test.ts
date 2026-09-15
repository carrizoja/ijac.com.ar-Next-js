import { describe, expect, it } from "vitest";

import { resolveTheme, themeBootstrapScript, THEME_STORAGE_KEY } from "./theme";

describe("resolveTheme", () => {
  it("returns light only for the exact stored light value", () => {
    expect(resolveTheme("light")).toBe("light");
  });

  it("falls back to dark for anything else", () => {
    expect(resolveTheme("dark")).toBe("dark");
    expect(resolveTheme(null)).toBe("dark");
    expect(resolveTheme("")).toBe("dark");
    expect(resolveTheme("LIGHT")).toBe("dark");
    expect(resolveTheme("nonsense")).toBe("dark");
  });

  it("uses a namespaced storage key", () => {
    expect(THEME_STORAGE_KEY).toBe("ijac-theme");
  });
});

describe("themeBootstrapScript", () => {
  it("clears the dark class only for a stored light preference", () => {
    expect(themeBootstrapScript).toContain(THEME_STORAGE_KEY);
    expect(themeBootstrapScript).toContain("classList.remove('dark')");
    expect(themeBootstrapScript).toContain("'light'");
  });

  it("survives storage throwing in privacy modes", () => {
    expect(themeBootstrapScript).toMatch(/^try\{/);
    expect(themeBootstrapScript).toMatch(/catch\(e\)\{\}$/);
  });

  it("never consults the OS preference", () => {
    expect(themeBootstrapScript).not.toContain("matchMedia");
  });

  it("runs as one statement with no line breaks", () => {
    expect(themeBootstrapScript).not.toContain("\n");
  });
});
