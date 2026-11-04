// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { businessPostalAddress } from "@/data/business";
import { serviceDetailContent } from "@/i18n/services/detail";
import ServiceDetailPage from "./page";

describe("ServiceDetailPage local SEO", () => {
  it("renders the localized FAQ heading and the shared business address in the provider schema", async () => {
    const { container } = render(
      await ServiceDetailPage({ params: Promise.resolve({ slug: "armado-pcs-hardware" }) }),
    );

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: `${serviceDetailContent.es.faqHeading}: Armado de PC Gamer y Consultoría de Hardware en Almagro - CABA`,
      }),
    ).toBeInTheDocument();

    const schemas = Array.from(
      container.querySelectorAll('script[type="application/ld+json"]'),
    ).map((script) => JSON.parse(script.textContent ?? "{}"));
    const serviceSchema = schemas.find((schema) => schema["@type"] === "Service");
    expect(serviceSchema?.provider?.address).toEqual(businessPostalAddress);
  });
});
