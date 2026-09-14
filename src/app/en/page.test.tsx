// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../components/Hero", () => ({ Hero: () => <div>English Hero</div> }));
vi.mock("../components/Services", () => ({ Services: () => <div>English Services</div> }));
vi.mock("../components/RemoteSupportBanner", () => ({
  RemoteSupportBanner: () => <section data-testid="remote-support">English remote support</section>,
}));
vi.mock("../components/About", () => ({
  About: ({ locale }: { locale?: string }) => <div data-testid="about" data-locale={locale}>English About</div>,
}));
vi.mock("../components/Testimonials", () => ({
  default: ({ locale }: { locale?: string }) => (
    <div data-testid="testimonials" data-locale={locale}>English Testimonials</div>
  ),
}));
vi.mock("../components/Contact", () => ({
  Contact: ({ locale }: { locale?: string }) => <div data-testid="contact" data-locale={locale}>English Contact</div>,
}));

import EnglishHomePage, { metadata } from "./page";

describe("English Home page", () => {
  it("renders the real localized Home sections in conversion order", () => {
    render(<EnglishHomePage />);

    const services = screen.getByText("English Services").closest("section");
    const banner = screen.getByTestId("remote-support");
    expect(screen.getByText("English Hero")).toBeInTheDocument();
    expect(services?.nextElementSibling).toBe(banner);

    const about = screen.getByTestId("about").closest("section");
    const testimonials = screen.getByTestId("testimonials").closest("section");
    const contact = screen.getByTestId("contact").closest("section");
    expect(banner.nextElementSibling).toBe(about);
    expect(about?.nextElementSibling).toBe(testimonials);
    expect(testimonials?.nextElementSibling).toBe(contact);
  });

  it("passes the English locale to About, Testimonials, and Contact and ids their anchors", () => {
    const { container } = render(<EnglishHomePage />);

    expect(screen.getByTestId("about")).toHaveAttribute("data-locale", "en");
    expect(screen.getByTestId("testimonials")).toHaveAttribute("data-locale", "en");
    expect(screen.getByTestId("contact")).toHaveAttribute("data-locale", "en");

    expect(container.querySelector("#about")).toContainElement(screen.getByTestId("about"));
    expect(container.querySelector("#testimonials")).toContainElement(screen.getByTestId("testimonials"));
    expect(container.querySelector("#contact")).toContainElement(screen.getByTestId("contact"));
  });

  it("publishes canonical and reciprocal language metadata", () => {
    expect(metadata.alternates).toMatchObject({
      canonical: "https://ijac.com.ar/en",
      languages: {
        es: "https://ijac.com.ar/",
        en: "https://ijac.com.ar/en",
        "x-default": "https://ijac.com.ar/",
      },
    });
  });

  it("publishes a real homepage title and description, not the slice-1 placeholder", () => {
    expect(metadata.title).not.toBe("English site");
    expect(String(metadata.title)).toMatch(/iJac IT Solutions/);
    expect(String(metadata.description)).not.toMatch(/being introduced in stages/i);
    expect(String(metadata.description)).toMatch(/iJac IT Solutions/);
  });
});
