// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../components/Hero", () => ({ Hero: () => <div>Hero</div> }));
vi.mock("../components/Testimonials", () => ({ default: () => <div>Testimonials</div> }));
vi.mock("../components/Services", () => ({ Services: () => <div>Services</div> }));
vi.mock("../components/Contact", () => ({ Contact: () => <div>Contact</div> }));
vi.mock("../components/About", () => ({ About: () => <div>About</div> }));
vi.mock("../components/RemoteSupportBanner", () => ({
  RemoteSupportBanner: () => <div data-testid="remote-support-banner">Remote support</div>,
}));

import Home from "./page";

describe("home information architecture", () => {
  it("does not render FAQ content or FAQ structured data", () => {
    const { container } = render(<Home />);

    expect(container.querySelector("#faq")).not.toBeInTheDocument();

    const structuredDataTypes = Array.from(
      container.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'),
      (script) =>
        (JSON.parse(script.textContent ?? "{}") as { "@type"?: string })["@type"],
    );
    expect(structuredDataTypes).not.toContain("FAQPage");
  });

  it("places remote support after featured services and before the about section", () => {
    render(<Home />);

    const services = screen.getByText("Services").closest("section");
    const banner = screen.getByTestId("remote-support-banner");
    const about = screen.getByText("About").closest("section");

    expect(services?.nextElementSibling).toBe(banner);
    expect(banner.nextElementSibling).toBe(about);
  });
});
