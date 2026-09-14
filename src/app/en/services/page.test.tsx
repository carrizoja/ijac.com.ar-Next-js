// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getServiceSlugsForLocale } from "@/i18n/services/catalog";
import EnglishServicesPage, { metadata } from "./page";

describe("English services listing page", () => {
  it("renders one article per English service slug, linking to its detail page", () => {
    const { container } = render(<EnglishServicesPage />);
    const englishSlugs = getServiceSlugsForLocale("en");

    expect(englishSlugs).toHaveLength(8);

    for (const slug of englishSlugs) {
      const article = container.querySelector(`#${slug}`);
      expect(article).not.toBeNull();
    }

    const detailLinks = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"))
      .filter((href): href is string => Boolean(href) && href!.startsWith("/en/services/"));

    for (const slug of englishSlugs) {
      expect(detailLinks).toContain(`/en/services/${slug}`);
    }
  });

  it("publishes English breadcrumb structured data pointing at /en and /en/services", () => {
    const { container } = render(<EnglishServicesPage />);

    const scripts = Array.from(
      container.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'),
    );
    const breadcrumbScript = scripts.find((script) => {
      const data = JSON.parse(script.textContent ?? "{}");
      return data["@type"] === "BreadcrumbList";
    });

    expect(breadcrumbScript).toBeDefined();
    const breadcrumbData = JSON.parse(breadcrumbScript!.textContent ?? "{}");
    expect(breadcrumbData.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ijac.com.ar/en" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Services",
        item: "https://ijac.com.ar/en/services",
      },
    ]);
  });

  it("publishes an English ItemList JSON-LD using English service detail URLs", () => {
    const { container } = render(<EnglishServicesPage />);
    const englishSlugs = getServiceSlugsForLocale("en");

    const scripts = Array.from(
      container.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'),
    );
    const itemListScript = scripts.find((script) => {
      const data = JSON.parse(script.textContent ?? "{}");
      return data["@type"] === "ItemList";
    });

    expect(itemListScript).toBeDefined();
    const itemListData = JSON.parse(itemListScript!.textContent ?? "{}");
    const urls = itemListData.itemListElement.map((item: { url: string }) => item.url);

    for (const slug of englishSlugs) {
      expect(urls).toContain(`https://ijac.com.ar/en/services/${slug}`);
    }
  });

  it("publishes English metadata with a canonical English URL", () => {
    expect(metadata.alternates?.canonical).toBe("https://ijac.com.ar/en/services");
    expect(metadata.title).toMatch(/services/i);
    expect(metadata.title).not.toMatch(/servicios/i);
  });

  it("declares reciprocal hreflang alternates pointing back at the Spanish services listing", () => {
    expect(metadata.alternates?.languages).toEqual({
      es: "https://ijac.com.ar/services",
      en: "https://ijac.com.ar/en/services",
      "x-default": "https://ijac.com.ar/services",
    });
  });

  it("titles breadcrumb links in English, not Spanish", () => {
    render(<EnglishServicesPage />);

    expect(screen.getByTitle("Go to Home")).toBeInTheDocument();
    expect(screen.queryByTitle(/^Ir a /)).not.toBeInTheDocument();
  });
});
