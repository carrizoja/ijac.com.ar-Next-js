import { describe, expect, it } from "vitest";

import { getSeoAlternates } from "./seo";

describe("getSeoAlternates", () => {
  it("builds canonical and reciprocal language alternates for the Spanish home", () => {
    expect(getSeoAlternates("/", "es")).toEqual({
      canonical: "https://ijac.com.ar/",
      languages: {
        es: "https://ijac.com.ar/",
        en: "https://ijac.com.ar/en",
        "x-default": "https://ijac.com.ar/",
      },
    });
  });

  it("builds canonical and reciprocal language alternates for the English home", () => {
    expect(getSeoAlternates("/", "en")).toEqual({
      canonical: "https://ijac.com.ar/en",
      languages: {
        es: "https://ijac.com.ar/",
        en: "https://ijac.com.ar/en",
        "x-default": "https://ijac.com.ar/",
      },
    });
  });

  it("builds alternates for the Spanish contact page", () => {
    expect(getSeoAlternates("/contact", "es")).toEqual({
      canonical: "https://ijac.com.ar/contact",
      languages: {
        es: "https://ijac.com.ar/contact",
        en: "https://ijac.com.ar/en/contact",
        "x-default": "https://ijac.com.ar/contact",
      },
    });
  });

  it("builds alternates for the English contact page", () => {
    expect(getSeoAlternates("/contact", "en")).toEqual({
      canonical: "https://ijac.com.ar/en/contact",
      languages: {
        es: "https://ijac.com.ar/contact",
        en: "https://ijac.com.ar/en/contact",
        "x-default": "https://ijac.com.ar/contact",
      },
    });
  });

  it("builds alternates for the Spanish services listing", () => {
    const alternates = getSeoAlternates("/services", "es");
    expect(alternates.canonical).toBe("https://ijac.com.ar/services");
    expect(alternates.languages).toEqual({
      es: "https://ijac.com.ar/services",
      en: "https://ijac.com.ar/en/services",
      "x-default": "https://ijac.com.ar/services",
    });
  });

  it("builds alternates for the English services listing", () => {
    const alternates = getSeoAlternates("/services", "en");
    expect(alternates.canonical).toBe("https://ijac.com.ar/en/services");
    expect(alternates.languages).toEqual({
      es: "https://ijac.com.ar/services",
      en: "https://ijac.com.ar/en/services",
      "x-default": "https://ijac.com.ar/services",
    });
  });

  it("resolves the translated slug for a Spanish service detail page", () => {
    const alternates = getSeoAlternates("/services/diseno-ux-ui", "es");
    expect(alternates.canonical).toBe("https://ijac.com.ar/services/diseno-ux-ui");
    expect(alternates.languages).toEqual({
      es: "https://ijac.com.ar/services/diseno-ux-ui",
      en: "https://ijac.com.ar/en/services/ux-ui-design",
      "x-default": "https://ijac.com.ar/services/diseno-ux-ui",
    });
  });

  it("resolves the translated slug for an English service detail page", () => {
    const alternates = getSeoAlternates("/services/diseno-ux-ui", "en");
    expect(alternates.canonical).toBe("https://ijac.com.ar/en/services/ux-ui-design");
    expect(alternates.languages).toEqual({
      es: "https://ijac.com.ar/services/diseno-ux-ui",
      en: "https://ijac.com.ar/en/services/ux-ui-design",
      "x-default": "https://ijac.com.ar/services/diseno-ux-ui",
    });
  });

  it("omits the English alternate for a path with no English counterpart", () => {
    const alternates = getSeoAlternates("/politica-de-privacidad", "es");
    expect(alternates.canonical).toBe("https://ijac.com.ar/politica-de-privacidad");
    expect(alternates.languages).toBeUndefined();
  });
});
