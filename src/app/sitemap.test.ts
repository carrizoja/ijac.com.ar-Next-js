import { describe, expect, it } from "vitest";

import { getServiceSlugsForLocale } from "@/i18n/services/catalog";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("emits 22 entries: 11 Spanish and 11 English", () => {
    const entries = sitemap();
    expect(entries).toHaveLength(22);

    const englishEntries = entries.filter((entry) => entry.url.includes("/en"));
    expect(englishEntries).toHaveLength(11);
  });

  it("never lists the noindex legal pages", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).not.toEqual(
      expect.arrayContaining([expect.stringContaining("politica-de-privacidad")]),
    );
    expect(urls).not.toEqual(
      expect.arrayContaining([expect.stringContaining("terminos-y-condiciones")]),
    );
  });

  it("includes the English home, contact, and services listing", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("https://ijac.com.ar/en");
    expect(urls).toContain("https://ijac.com.ar/en/contact");
    expect(urls).toContain("https://ijac.com.ar/en/services");
  });

  it("includes all 8 English service detail URLs, derived from the catalog", () => {
    const urls = sitemap().map((entry) => entry.url);
    const englishSlugs = getServiceSlugsForLocale("en");

    expect(englishSlugs).toHaveLength(8);
    for (const slug of englishSlugs) {
      expect(urls).toContain(`https://ijac.com.ar/en/services/${slug}`);
    }
  });

  it("declares reciprocal hreflang alternates on the Spanish and English homes", () => {
    const entries = sitemap();
    const esHome = entries.find((entry) => entry.url === "https://ijac.com.ar");
    const enHome = entries.find((entry) => entry.url === "https://ijac.com.ar/en");

    expect(esHome?.alternates?.languages).toEqual({
      es: "https://ijac.com.ar",
      en: "https://ijac.com.ar/en",
      "x-default": "https://ijac.com.ar",
    });
    expect(enHome?.alternates?.languages).toEqual(esHome?.alternates?.languages);
  });

  it("declares reciprocal hreflang alternates on a Spanish/English service detail pair", () => {
    const entries = sitemap();
    const esDetail = entries.find(
      (entry) => entry.url === "https://ijac.com.ar/services/diseno-ux-ui",
    );
    const enDetail = entries.find(
      (entry) => entry.url === "https://ijac.com.ar/en/services/ux-ui-design",
    );

    expect(esDetail?.alternates?.languages).toEqual({
      es: "https://ijac.com.ar/services/diseno-ux-ui",
      en: "https://ijac.com.ar/en/services/ux-ui-design",
      "x-default": "https://ijac.com.ar/services/diseno-ux-ui",
    });
    expect(enDetail?.alternates?.languages).toEqual(esDetail?.alternates?.languages);
  });
});
