import { describe, expect, it } from "vitest";

import { themeContent } from "./theme";

describe("themeContent", () => {
  it("names the action, not the current state", () => {
    expect(themeContent.en.toLight).toBe("Switch to light mode");
    expect(themeContent.en.toDark).toBe("Switch to dark mode");
  });

  it("uses neutral professional Spanish", () => {
    expect(themeContent.es.toLight).toBe("Cambiar a modo claro");
    expect(themeContent.es.toDark).toBe("Cambiar a modo oscuro");
  });

  it("covers both locales", () => {
    for (const locale of ["es", "en"] as const) {
      expect(themeContent[locale].toLight.length).toBeGreaterThan(0);
      expect(themeContent[locale].toDark.length).toBeGreaterThan(0);
    }
  });
});
