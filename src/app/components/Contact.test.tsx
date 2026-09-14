// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { business } from "../../data/business";
import { Contact } from "./Contact";

describe("Contact", () => {
  it("renders the Spanish heading, intro, card copy, and CTA by default", () => {
    render(<Contact />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Contactanos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Estamos acá para ayudarte con tus necesidades tecnológicas. No dudes en contactarnos por cualquiera de estos medios.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByRole("heading", { level: 3, name: "Ubicación" })).toBeInTheDocument();
    expect(screen.getByText("Argentina")).toBeInTheDocument();
    expect(screen.getByText("Seguinos en Instagram")).toBeInTheDocument();
    expect(screen.getByText("Escribinos por WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("Seguinos en Facebook")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "¿Dudas? Mandanos un mail" })).toBeInTheDocument();
  });

  it("keeps the info values, hrefs, and business data unlocalized", () => {
    render(<Contact />);

    expect(screen.getByTitle("Ubicación")).toHaveAttribute(
      "href",
      "https://maps.google.com/?q=Almagro,Buenos Aires,Argentina",
    );
    expect(screen.getByTitle("WhatsApp")).toHaveAttribute("href", business.whatsappUrl);
    expect(screen.getByText(business.phoneDisplay)).toBeInTheDocument();
    expect(screen.getByText("Almagro, Buenos Aires")).toBeInTheDocument();
  });

  it("localizes the heading, intro, card copy, and CTA for English", () => {
    render(<Contact locale="en" />);

    expect(screen.getByRole("heading", { level: 2, name: "Contact Us" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "We're here to help you with your technology needs. Feel free to reach out through any of these channels.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByRole("heading", { level: 3, name: "Location" })).toBeInTheDocument();
    expect(screen.getByText("Follow us on Instagram")).toBeInTheDocument();
    expect(screen.getByText("Message us on WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("Follow us on Facebook")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Questions? Send us an email" })).toBeInTheDocument();

    // Address and title/href stay unlocalized
    expect(screen.getByText("Argentina")).toBeInTheDocument();
    expect(screen.getByTitle("Location")).toHaveAttribute(
      "href",
      "https://maps.google.com/?q=Almagro,Buenos Aires,Argentina",
    );
  });
});
