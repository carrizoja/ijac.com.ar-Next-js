// @vitest-environment jsdom

import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "--font-inter" }),
  Space_Grotesk: () => ({ variable: "--font-space-grotesk" }),
}));

/**
 * The real `next/script` never renders inline children as text, so this mock
 * renders them into a real <script> element. That is what lets the assertions
 * read the GA init body instead of a testid.
 */
vi.mock("next/script", () => ({
  default: ({
    id,
    src,
    strategy,
    children,
  }: {
    id?: string;
    src?: string;
    strategy?: string;
    children?: ReactNode;
  }) => (
    <script data-testid={`script-${id ?? "anonymous"}`} data-src={src} data-strategy={strategy}>
      {children}
    </script>
  ),
}));

vi.mock("./Navbarijac", () => ({ NavbarIjac: () => <nav data-testid="navbar" /> }));
vi.mock("./HamburgerMenu", () => ({ HamburgerMenu: () => <nav data-testid="hamburger" /> }));
vi.mock("./Footer", () => ({ default: () => <footer data-testid="footer" /> }));
vi.mock("./AIChat", () => ({ AIChat: () => <div data-testid="ai-chat" /> }));
vi.mock("./PerformanceMonitor", () => ({ PerformanceMonitor: () => <div data-testid="performance-monitor" /> }));
vi.mock("./CookieConsent", () => ({ CookieConsent: () => <div data-testid="cookie-consent" /> }));
vi.mock("./ClientRedirect", () => ({ ClientRedirect: () => <div data-testid="client-redirect" /> }));

import SiteDocument from "./SiteDocument";
import { consentBootstrapScript } from "../lib/consent";
import { themeBootstrapScript } from "../lib/theme";

const LOCALES = ["es", "en"] as const;

function renderDocument(locale: (typeof LOCALES)[number]) {
  return render(<SiteDocument locale={locale}>{""}</SiteDocument>).container;
}

/**
 * The inline bootstraps end up in the real document head: React 19 hoists
 * script elements there. The mocked `next/script` tags stay in the container.
 */
function headBootstrapScripts() {
  return Array.from(document.head.querySelectorAll("script")).filter(
    (script) => !script.hasAttribute("data-testid"),
  );
}

describe("SiteDocument consent contract", () => {
  it.each(LOCALES)("puts the consent bootstrap right after the theme bootstrap in <%s>", (locale) => {
    renderDocument(locale);
    const scripts = headBootstrapScripts();

    const themeIndex = scripts.findIndex((script) => script.textContent === themeBootstrapScript);
    const consentIndex = scripts.findIndex((script) => script.textContent === consentBootstrapScript);

    expect(themeIndex).toBeGreaterThanOrEqual(0);
    expect(consentIndex).toBeGreaterThanOrEqual(0);
    expect(consentIndex).toBe(themeIndex + 1);
  });

  it.each(LOCALES)("keeps the GA init free of dataLayer/gtag setup in <%s>", (locale) => {
    const container = renderDocument(locale);
    const init = container.querySelector('[data-testid="script-google-analytics"]');

    expect(init).toBeTruthy();
    const body = init?.textContent ?? "";

    expect(body).toContain("gtag('config'");
    expect(body).not.toContain("window.dataLayer");
    expect(body).not.toContain("function gtag");
  });

  it.each(LOCALES)("loads the same GA measurement id in <%s>", (locale) => {
    const container = renderDocument(locale);
    const loader = container.querySelector('script[data-src*="googletagmanager.com/gtag/js"]');

    expect(loader?.getAttribute("data-src")).toContain("G-8NYPRQK16F");
    expect(loader?.getAttribute("data-strategy")).toBe("lazyOnload");
  });
});
