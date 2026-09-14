import { describe, expect, it } from "vitest";

import { getServiceCopyForLocale } from "../services/catalog";
import { servicesContent } from "./services";

describe("English services home summary", () => {
  it("does not point visitors to the Spanish catalog now that English service pages exist", () => {
    expect(servicesContent.en.summary).not.toContain("Spanish service catalog");
    expect(servicesContent.en.summary).not.toContain("reviewed English service pages are prepared");
  });

  it("keeps the Spanish summary untouched", () => {
    expect(servicesContent.es.summary).toBe(
      "Descubre nuestros servicios destacados y visita la pagina de servicios para explorar el catalogo completo, con mas soluciones, detalles y alternativas para tu necesidad.",
    );
  });
});

describe("English featured service cards", () => {
  it("agree with the English catalog for every featured slug", () => {
    const featuredSlugs = [
      "ciberseguridad-proteccion-datos",
      "desarrollo-web-apps",
      "soporte-tecnico-pc-mac-apple",
      "redes-wifi-cableado",
    ] as const;

    for (const slug of featuredSlugs) {
      const catalogCopy = getServiceCopyForLocale(slug, "en");
      const cardCopy = servicesContent.en.cards?.[slug];

      expect(cardCopy).toEqual({
        title: catalogCopy?.title,
        desc: catalogCopy?.desc,
        alt: catalogCopy?.alt,
      });
    }
  });
});
