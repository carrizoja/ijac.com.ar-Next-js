// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Locale } from "@/i18n/routing";

import { StructuredData } from "./StructuredData";

function schemasFor(locale?: Locale) {
  const { container } = render(
    locale ? <StructuredData locale={locale} /> : <StructuredData />,
  );

  return [...container.querySelectorAll('script[type="application/ld+json"]')].map(
    (script) => JSON.parse(script.innerHTML) as Record<string, unknown>,
  );
}

const typeOf = (schemas: Record<string, unknown>[], type: string) =>
  schemas.find((schema) => schema["@type"] === type);

describe("StructuredData", () => {
  it("emits an Organization and a LocalBusiness", () => {
    const schemas = schemasFor();

    expect(schemas).toHaveLength(2);
    expect(typeOf(schemas, "Organization")).toBeDefined();
    expect(typeOf(schemas, "LocalBusiness")).toBeDefined();
  });

  it("describes the business in Spanish by default", () => {
    const schemas = schemasFor();

    expect(typeOf(schemas, "Organization")?.description).toBe(
      "Soluciones informáticas profesionales, desarrollo web y consultoría IT a nivel global con sede en Buenos Aires",
    );
    expect(typeOf(schemas, "LocalBusiness")?.description).toBe(
      "Soluciones informáticas profesionales en Buenos Aires con alcance global",
    );
  });

  it("describes the business in English for the English site", () => {
    const schemas = schemasFor("en");

    expect(String(typeOf(schemas, "Organization")?.description)).toMatch(/IT consulting/i);
    expect(String(typeOf(schemas, "LocalBusiness")?.description)).toMatch(/Buenos Aires/);
    for (const schema of schemas) {
      expect(String(schema.description)).not.toMatch(/Soluciones inform/);
    }
  });

  it("keeps the business facts identical across locales", () => {
    const es = schemasFor();
    const en = schemasFor("en");

    for (const type of ["Organization", "LocalBusiness"]) {
      expect(typeOf(en, type)?.url).toBe(typeOf(es, type)?.url);
      expect(typeOf(en, type)?.address).toEqual(typeOf(es, type)?.address);
      expect(typeOf(en, type)?.telephone).toBe(typeOf(es, type)?.telephone);
    }
  });

  it("does not claim to serve cuisine", () => {
    // servesCuisine is a Restaurant property; it misdescribes an IT business.
    for (const schema of [...schemasFor(), ...schemasFor("en")]) {
      expect(schema).not.toHaveProperty("servesCuisine");
    }
  });

  it("includes accurate Almagro streetAddress, geo coordinates, areaServed, and OfferCatalog in LocalBusiness", () => {
    const localBusiness = typeOf(schemasFor(), "LocalBusiness") as {
      address?: { streetAddress?: string; postalCode?: string };
      geo?: { latitude?: string; longitude?: string };
      areaServed?: Array<{ name?: string }>;
      hasOfferCatalog?: { itemListElement?: Array<{ itemOffered?: { name?: string } }> };
    };

    expect(localBusiness?.address?.streetAddress).toBe("Colombres 195, Almagro");
    expect(localBusiness?.address?.postalCode).toBe("C1177");
    expect(localBusiness?.geo).toEqual({
      "@type": "GeoCoordinates",
      latitude: "-34.6119",
      longitude: "-58.4206",
    });
    expect(localBusiness?.areaServed?.map((a) => a.name)).toContain("Almagro");
    expect(
      localBusiness?.hasOfferCatalog?.itemListElement?.map((o) => o.itemOffered?.name),
    ).toContain("Armado de PC Gamer y Consultoría de Hardware en Almagro - CABA");
  });
});
