// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

import { notFound } from "next/navigation";
import { getServiceSlugsForLocale } from "@/i18n/services/catalog";
import ServiceDetailPage, { generateMetadata, generateStaticParams } from "./page";

describe("generateStaticParams", () => {
  it("emits one param per English service slug", async () => {
    const params = await generateStaticParams();

    expect(params).toEqual(getServiceSlugsForLocale("en").map((slug) => ({ slug })));
    expect(params).toHaveLength(8);
  });
});

describe("generateMetadata", () => {
  it("publishes an English canonical URL and title for a known slug", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "web-app-development" }),
    });

    expect(metadata.alternates?.canonical).toBe(
      "https://ijac.com.ar/en/services/web-app-development",
    );
    expect(metadata.title).toContain("Web and Mobile Application Development");
  });

  it("declares reciprocal hreflang alternates pointing back at the Spanish service detail page", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "web-app-development" }),
    });

    expect(metadata.alternates?.languages).toEqual({
      es: "https://ijac.com.ar/services/desarrollo-web-apps",
      en: "https://ijac.com.ar/en/services/web-app-development",
      "x-default": "https://ijac.com.ar/services/desarrollo-web-apps",
    });
  });

  it("returns a not-found title for an unknown slug", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "not-a-real-service" }),
    });

    expect(metadata.title).toBe("Service not found | iJac IT Solutions");
  });
});

describe("ServiceDetailPage", () => {
  it("renders English chrome and breadcrumbs for a known slug", async () => {
    const element = await ServiceDetailPage({
      params: Promise.resolve({ slug: "cybersecurity-data-protection" }),
    });
    const { container } = render(element);

    expect(screen.getByText("Back to services").closest("a")).toHaveAttribute(
      "href",
      "/en/services",
    );
    expect(screen.getByText("Specialized solution")).toBeInTheDocument();
    expect(screen.getByText("How we deliver this service")).toBeInTheDocument();
    expect(screen.getByText("What's included")).toBeInTheDocument();
    expect(screen.getByTitle("Go to Home")).toBeInTheDocument();
    expect(screen.queryByTitle(/^Ir a /)).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Cybersecurity and Data Protection for Businesses",
      }),
    ).toBeInTheDocument();

    const jsonLdScript = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(jsonLdScript?.textContent ?? "{}");
    expect(jsonLd.url).toBe(
      "https://ijac.com.ar/en/services/cybersecurity-data-protection",
    );
  });

  it("links the CTA button to the English contact page, not a Spanish URL", async () => {
    const element = await ServiceDetailPage({
      params: Promise.resolve({ slug: "cybersecurity-data-protection" }),
    });
    render(element);

    const ctaButton = screen.getByRole("link", { name: "Request a security assessment" });
    expect(ctaButton).toHaveAttribute("href", "/en/contact");
  });

  it("calls notFound for an unmapped slug", async () => {
    await expect(
      ServiceDetailPage({ params: Promise.resolve({ slug: "not-a-real-service" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });
});
