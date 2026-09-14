import { describe, expect, it } from "vitest";

import { getServiceBySlug, getServiceSlugs } from "../../data/services.js";
import {
  getCanonicalSlug,
  getEnglishSlug,
  getServiceByLocaleSlug,
  getServiceCopyForLocale,
  getServiceSlugsForLocale,
} from "./catalog";

const slugMap: Array<[string, string]> = [
  ["ciberseguridad-proteccion-datos", "cybersecurity-data-protection"],
  ["armado-pcs-hardware", "pc-building-hardware-consulting"],
  ["redes-wifi-cableado", "wifi-networks-structured-cabling"],
  ["soporte-tecnico-pc-mac-apple", "technical-support-pc-mac-apple"],
  ["diseno-ux-ui", "ux-ui-design"],
  ["desarrollo-web-apps", "web-app-development"],
  ["data-science-inteligencia-artificial", "data-science-artificial-intelligence"],
  ["branding-marketing-digital", "branding-digital-marketing"],
];

describe("service slug mapping", () => {
  it.each(slugMap)("maps canonical slug %s to English slug %s", (slugEs, slugEn) => {
    expect(getEnglishSlug(slugEs)).toBe(slugEn);
  });

  it.each(slugMap)("maps English slug %s back to canonical slug %s", (slugEs, slugEn) => {
    expect(getCanonicalSlug(slugEn)).toBe(slugEs);
  });

  it("returns undefined for an unknown canonical slug", () => {
    expect(getEnglishSlug("not-a-real-service")).toBeUndefined();
  });

  it("returns undefined for an unknown English slug", () => {
    expect(getCanonicalSlug("not-a-real-service")).toBeUndefined();
  });
});

describe("getServiceSlugsForLocale", () => {
  it("returns the canonical Spanish slugs for es", () => {
    expect(getServiceSlugsForLocale("es")).toEqual(getServiceSlugs());
  });

  it("returns all 8 English slugs, one per canonical service", () => {
    expect(getServiceSlugsForLocale("en")).toEqual(slugMap.map(([, slugEn]) => slugEn));
  });
});

describe("getServiceCopyForLocale", () => {
  it("returns the raw Spanish catalog fields for es", () => {
    const source = getServiceBySlug("desarrollo-web-apps");
    const copy = getServiceCopyForLocale("desarrollo-web-apps", "es");

    expect(copy).toMatchObject({
      slug: "desarrollo-web-apps",
      slugEs: "desarrollo-web-apps",
      title: source?.title,
      desc: source?.desc,
      seoIntro: source?.seoIntro,
      fullDescription: source?.fullDescription,
      highlights: source?.highlights,
      ctaLabel: source?.ctaLabel,
      alt: source?.alt,
      src: source?.src,
    });
  });

  it("returns English copy for en, reusing the src from the Spanish catalog", () => {
    const source = getServiceBySlug("desarrollo-web-apps");
    const copy = getServiceCopyForLocale("desarrollo-web-apps", "en");

    expect(copy?.slug).toBe("web-app-development");
    expect(copy?.slugEs).toBe("desarrollo-web-apps");
    expect(copy?.src).toBe(source?.src);
    expect(copy?.title).not.toBe(source?.title);
  });

  it("reuses the exact reviewed English strings already used on the homepage cards", () => {
    const copy = getServiceCopyForLocale("ciberseguridad-proteccion-datos", "en");

    expect(copy).toMatchObject({
      title: "Cybersecurity and Data Protection for Businesses",
      desc: "Firewall control, local network monitoring, user administration, malware protection, and security cameras.",
      alt: "Cybersecurity and data protection for businesses in Buenos Aires",
    });
  });

  it("provides English seoIntro, fullDescription, highlights, and ctaLabel for every service", () => {
    for (const [slugEs] of slugMap) {
      const copy = getServiceCopyForLocale(slugEs, "en");

      expect(copy?.seoIntro).toBeTruthy();
      expect(copy?.fullDescription).toBeTruthy();
      expect(copy?.highlights.length).toBeGreaterThan(0);
      expect(copy?.ctaLabel).toBeTruthy();
    }
  });

  it("returns undefined for an unknown slug", () => {
    expect(getServiceCopyForLocale("not-a-real-service", "en")).toBeUndefined();
    expect(getServiceCopyForLocale("not-a-real-service", "es")).toBeUndefined();
  });
});

describe("getServiceByLocaleSlug", () => {
  it("resolves an English slug to the same copy as its canonical slug", () => {
    expect(getServiceByLocaleSlug("web-app-development", "en")).toEqual(
      getServiceCopyForLocale("desarrollo-web-apps", "en"),
    );
  });

  it("resolves a Spanish slug directly for es", () => {
    expect(getServiceByLocaleSlug("desarrollo-web-apps", "es")).toEqual(
      getServiceCopyForLocale("desarrollo-web-apps", "es"),
    );
  });

  it("returns undefined for an English slug looked up under es", () => {
    expect(getServiceByLocaleSlug("web-app-development", "es")).toBeUndefined();
  });

  it("returns undefined for an unknown slug in either locale", () => {
    expect(getServiceByLocaleSlug("not-a-real-service", "en")).toBeUndefined();
    expect(getServiceByLocaleSlug("not-a-real-service", "es")).toBeUndefined();
  });
});
