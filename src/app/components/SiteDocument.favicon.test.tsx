// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "--font-inter" }),
  Space_Grotesk: () => ({ variable: "--font-space-grotesk" }),
}));

vi.mock("next/script", () => ({
  default: ({ id }: { id?: string }) => <script data-testid={`script-${id ?? "anonymous"}`} />,
}));

vi.mock("../lib/theme", () => ({
  themeBootstrapScript: "",
}));

vi.mock("./Navbarijac", () => ({ NavbarIjac: () => <nav data-testid="navbar" /> }));
vi.mock("./HamburgerMenu", () => ({ HamburgerMenu: () => <nav data-testid="hamburger" /> }));
vi.mock("./Footer", () => ({ default: () => <footer data-testid="footer" /> }));
vi.mock("./AIChat", () => ({ AIChat: () => <div data-testid="ai-chat" /> }));
vi.mock("./PerformanceMonitor", () => ({ PerformanceMonitor: () => <div data-testid="performance-monitor" /> }));
vi.mock("./CookieConsent", () => ({ CookieConsent: () => <div data-testid="cookie-consent" /> }));
vi.mock("./ClientRedirect", () => ({ ClientRedirect: () => <div data-testid="client-redirect" /> }));

import SiteDocument from "./SiteDocument";

function getIconLinks() {
  return Array.from(document.head.querySelectorAll('link[rel="icon"]'));
}

describe("SiteDocument favicon contract", () => {
  it("advertises the current favicon as the unconditional fallback first", () => {
    render(<SiteDocument locale="es">{""}</SiteDocument>);

    const icons = getIconLinks();
    const fallback = icons.find((el) => el.getAttribute("href") === "/icon.png" && !el.getAttribute("media"));

    expect(fallback).toBeTruthy();
    expect(fallback?.getAttribute("type")).toBe("image/png");
    expect(icons.indexOf(fallback!)).toBe(0);
  });

  it("advertises light- and dark-scheme favicon links after the fallback", () => {
    render(<SiteDocument locale="en">{""}</SiteDocument>);

    const icons = getIconLinks();
    const fallback = icons.find((el) => el.getAttribute("href") === "/icon.png" && !el.getAttribute("media"));
    const light = icons.find((el) => el.getAttribute("href") === "/icon.png" && el.getAttribute("media") === "(prefers-color-scheme: light)");
    const dark = icons.find((el) => el.getAttribute("href") === "/favicon-dark.png" && el.getAttribute("media") === "(prefers-color-scheme: dark)");

    expect(fallback).toBeTruthy();
    expect(light).toBeTruthy();
    expect(dark).toBeTruthy();
    expect(light?.getAttribute("type")).toBe("image/png");
    expect(dark?.getAttribute("type")).toBe("image/png");
    expect(icons.indexOf(light!)).toBeGreaterThan(icons.indexOf(fallback!));
    expect(icons.indexOf(dark!)).toBeGreaterThan(icons.indexOf(fallback!));
  });

  it("applies the same favicon contract for Spanish and English locale roots", () => {
    const { unmount: unmountSpanish } = render(<SiteDocument locale="es">{""}</SiteDocument>);
    const spanishIcons = getIconLinks().map((el) => ({
      href: el.getAttribute("href"),
      media: el.getAttribute("media"),
      type: el.getAttribute("type"),
    }));
    unmountSpanish();

    const { unmount: unmountEnglish } = render(<SiteDocument locale="en">{""}</SiteDocument>);
    const englishIcons = getIconLinks().map((el) => ({
      href: el.getAttribute("href"),
      media: el.getAttribute("media"),
      type: el.getAttribute("type"),
    }));
    unmountEnglish();

    expect(spanishIcons).toEqual(englishIcons);
  });
});
