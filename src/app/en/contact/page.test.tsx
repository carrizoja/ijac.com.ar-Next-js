// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { business } from "@/data/business";
import { getWhatsAppUrl } from "@/i18n/whatsapp";
import EnglishContactPage, { metadata } from "./page";

describe("English contact page", () => {
  it("publishes English metadata with a canonical English URL", () => {
    expect(metadata.alternates?.canonical).toBe("https://ijac.com.ar/en/contact");
    expect(metadata.title).toMatch(/contact/i);
    expect(metadata.title).not.toMatch(/contacto/i);
  });

  it("declares reciprocal hreflang alternates pointing back at the Spanish contact page", () => {
    expect(metadata.alternates?.languages).toEqual({
      es: "https://ijac.com.ar/contact",
      en: "https://ijac.com.ar/en/contact",
      "x-default": "https://ijac.com.ar/contact",
    });
  });

  it("publishes ContactPage JSON-LD with the business contact point", () => {
    const { container } = render(<EnglishContactPage />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent ?? "{}");

    expect(jsonLd["@type"]).toBe("ContactPage");
    expect(jsonLd.mainEntity.contactPoint.telephone).toBe(business.phoneDisplay);
    expect(jsonLd.mainEntity.contactPoint.email).toBe(business.email);
  });

  it("renders English breadcrumbs pointing at /en and /en/contact", () => {
    render(<EnglishContactPage />);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/en");
    expect(screen.getByTitle("Go to Home")).toBeInTheDocument();
    expect(screen.queryByTitle(/^Ir a /)).not.toBeInTheDocument();
  });

  it("renders the English heading and intro copy, not the Spanish copy", () => {
    render(<EnglishContactPage />);

    expect(screen.getByRole("heading", { name: /contact us/i })).toBeInTheDocument();
    expect(screen.queryByText("Contactanos")).not.toBeInTheDocument();
    expect(screen.queryByText("Ponete en contacto con nuestro equipo")).not.toBeInTheDocument();
  });

  it("renders the FAQ section in English", () => {
    render(<EnglishContactPage />);

    expect(
      screen.getByRole("heading", { name: "Frequently Asked Questions" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Preguntas Frecuentes")).not.toBeInTheDocument();
  });

  it("renders English contact-information labels and mailto/tel links", () => {
    render(<EnglishContactPage />);

    expect(screen.getByRole("heading", { name: "Contact Information" })).toBeInTheDocument();
    expect(screen.getByText("Email:")).toBeInTheDocument();
    expect(screen.getByText("Phone:")).toBeInTheDocument();
    expect(screen.getByText("Address:")).toBeInTheDocument();

    const emailLink = screen.getByTitle("Send an email to iJAC");
    expect(emailLink).toHaveAttribute("href", `mailto:${business.email}`);

    const phoneLink = screen.getByTitle("Call iJAC");
    expect(phoneLink).toHaveAttribute("href", `tel:${business.phoneHref}`);
  });

  it("renders an English business-hours card without printing the Spanish hours string", () => {
    render(<EnglishContactPage />);

    expect(screen.getByRole("heading", { name: "Business Hours" })).toBeInTheDocument();
    expect(screen.queryByText(business.hours.display)).not.toBeInTheDocument();
  });

  it("renders a WhatsApp button linking to the business WhatsApp URL", () => {
    render(<EnglishContactPage />);

    const whatsappLink = screen.getByRole("link", { name: "WhatsApp" });
    expect(whatsappLink).toHaveAttribute("href", getWhatsAppUrl("en"));
  });
});
