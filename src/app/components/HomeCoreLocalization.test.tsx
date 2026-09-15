// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getWhatsAppUrl } from "@/i18n/whatsapp";

vi.mock("motion/react", () => ({
  motion: new Proxy({}, {
    get: (_target, tag: string) => ({ children, ...props }: React.HTMLAttributes<HTMLElement>) =>
      React.createElement(tag, props, children),
  }),
}));

vi.mock("./ui/hero-highlight", () => ({
  HeroHighlight: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("./TypeWriterEffectSmooth", () => ({
  TypewriterEffectSmoothDemo: ({ words }: { words: readonly string[] }) => <p>{words.join(" ")}</p>,
}));

import { Hero } from "./Hero";
import { RemoteSupportBanner } from "./RemoteSupportBanner";
import { Services } from "./Services";

describe("English Home conversion sections", () => {
  it("localizes the Hero heading, typewriter copy, and working CTA", () => {
    render(<Hero locale="en" />);

    expect(screen.getByRole("heading", { level: 1, name: /IT Solutions and Web Development/i })).toBeInTheDocument();
    expect(screen.getByText("We engineer a smarter world.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact us" })).toHaveAttribute("href", getWhatsAppUrl("en"));
  });

  it("localizes featured service cards while linking to the English service detail pages", () => {
    render(<Services locale="en" />);

    expect(screen.getByRole("heading", { name: "Our Technology Services" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cybersecurity and Data Protection for Businesses" })).toHaveAttribute(
      "href",
      "/en/services/cybersecurity-data-protection",
    );
    expect(screen.getByRole("link", { name: "View all services" })).toHaveAttribute("href", "/en/services");
  });

  it("localizes the remote-support claim, disclaimer, and WhatsApp CTA", () => {
    render(<RemoteSupportBanner locale="en" />);

    expect(screen.getByRole("heading", { name: /Remote assistance with TeamViewer/i })).toBeInTheDocument();
    expect(screen.getByText(/professional TeamViewer licenses/i)).toBeInTheDocument();
    expect(screen.getByText(/not affiliated with or endorsed by TeamViewer/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ask about remote support" })).toHaveAttribute(
      "href",
      getWhatsAppUrl("en"),
    );
  });
});
