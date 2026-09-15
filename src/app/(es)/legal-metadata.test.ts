import { describe, expect, it } from "vitest";

import { metadata as privacyMetadata } from "./politica-de-privacidad/page";
import { metadata as termsMetadata } from "./terminos-y-condiciones/page";

/**
 * The legal pages are Spanish-only and noindex. Without their own
 * `alternates` they inherit the root layout's, which points at the home
 * page — claiming the home page as their canonical and advertising an
 * English version that does not exist.
 */
describe.each([
  ["politica-de-privacidad", privacyMetadata],
  ["terminos-y-condiciones", termsMetadata],
])("%s metadata", (slug, metadata) => {
  it("is canonical to itself, not to the home page", () => {
    expect(metadata.alternates?.canonical).toBe(`https://ijac.com.ar/${slug}`);
  });

  it("advertises no language alternates, because no English version exists", () => {
    expect(metadata.alternates?.languages).toBeUndefined();
  });

  it("stays out of the index", () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });
});
