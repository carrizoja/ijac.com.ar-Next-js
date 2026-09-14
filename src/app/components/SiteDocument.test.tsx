import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "--font-inter" }),
  Space_Grotesk: () => ({ variable: "--font-space-grotesk" }),
}));

import { spanishMetadata } from "./SiteDocument";

describe("spanishMetadata", () => {
  it("renders the brand exactly once in the default home title", () => {
    const title = spanishMetadata.title;
    const defaultTitle =
      typeof title === "object" && title && "default" in title
        ? String((title as { default: string }).default)
        : String(title);

    expect(defaultTitle.split("iJac IT Solutions").length - 1).toBe(1);
  });

  it("declares canonical and reciprocal hreflang alternates for the Spanish home", () => {
    expect(spanishMetadata.alternates).toEqual({
      canonical: "https://ijac.com.ar/",
      languages: {
        es: "https://ijac.com.ar/",
        en: "https://ijac.com.ar/en",
        "x-default": "https://ijac.com.ar/",
      },
    });
  });
});
