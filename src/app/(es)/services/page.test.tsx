import { describe, expect, it } from "vitest";

import { metadata } from "./page";

describe("services listing page metadata", () => {
  it("renders the brand exactly once once the root title template applies", () => {
    expect(typeof metadata.title).toBe("string");
    expect(String(metadata.title)).not.toContain("iJac IT Solutions");
  });

  it("declares canonical and reciprocal hreflang alternates", () => {
    expect(metadata.alternates).toEqual({
      canonical: "https://ijac.com.ar/services",
      languages: {
        es: "https://ijac.com.ar/services",
        en: "https://ijac.com.ar/en/services",
        "x-default": "https://ijac.com.ar/services",
      },
    });
  });
});
