import { describe, expect, it } from "vitest";

import { getServiceSlugs } from "@/data/services";
import { generateMetadata } from "./page";

describe("service detail page metadata", () => {
  it.each(getServiceSlugs())(
    "renders the brand exactly once for %s once the root title template applies",
    async (slug) => {
      const metadata = await generateMetadata({ params: Promise.resolve({ slug }) });
      expect(typeof metadata.title).toBe("string");
      expect(String(metadata.title)).not.toContain("iJac IT Solutions");
    },
  );

  it("declares canonical and reciprocal hreflang alternates for a known slug", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "diseno-ux-ui" }),
    });

    expect(metadata.alternates).toEqual({
      canonical: "https://ijac.com.ar/services/diseno-ux-ui",
      languages: {
        es: "https://ijac.com.ar/services/diseno-ux-ui",
        en: "https://ijac.com.ar/en/services/ux-ui-design",
        "x-default": "https://ijac.com.ar/services/diseno-ux-ui",
      },
    });
  });

  it("returns a not-found title without duplicating the brand for an unknown slug", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "not-a-real-service" }),
    });

    expect(String(metadata.title)).not.toContain("iJac IT Solutions");
  });
});
