// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ContactPage, { metadata } from "./page";

describe("contact page metadata", () => {
  it("renders the brand exactly once once the root title template applies", () => {
    expect(typeof metadata.title).toBe("string");
    expect(String(metadata.title)).not.toContain("iJac IT Solutions");
  });

  it("declares canonical and reciprocal hreflang alternates", () => {
    expect(metadata.alternates).toEqual({
      canonical: "https://ijac.com.ar/contact",
      languages: {
        es: "https://ijac.com.ar/contact",
        en: "https://ijac.com.ar/en/contact",
        "x-default": "https://ijac.com.ar/contact",
      },
    });
  });
});

describe("contact page information architecture", () => {
  it("places the FAQ and its structured data before the contact methods", () => {
    const { container } = render(<ContactPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Contactanos" })).toBeInTheDocument();

    const faqHeading = screen.getByRole("heading", {
      level: 2,
      name: "Preguntas Frecuentes",
    });
    const contactHeading = screen.getByRole("heading", {
      level: 2,
      name: "Información de Contacto",
    });

    expect(
      faqHeading.compareDocumentPosition(contactHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    const structuredData = Array.from(
      container.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'),
      (script) => JSON.parse(script.textContent ?? "{}") as { "@type"?: string },
    );

    const structuredDataTypes = structuredData.map((data) => data["@type"]);
    expect(structuredDataTypes).toContain("ContactPage");
    expect(structuredDataTypes.filter((type) => type === "FAQPage")).toHaveLength(1);
  });
});
