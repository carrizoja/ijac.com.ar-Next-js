import { describe, expect, it } from "vitest";

import {
  getHomeSectionHref,
  getHomeSectionId,
  getNavHref,
  getLocaleFromPath,
  getLocaleHref,
  getServiceDetailHref,
  isHomeSectionAvailable,
  localizePath,
  stripLocalePrefix,
} from "./routing";

describe("locale routing", () => {
  it.each([
    ["/", "es"],
    ["/contact", "es"],
    ["/en", "en"],
    ["/en/", "en"],
    ["/en/services/security", "en"],
    ["/english", "es"],
  ] as const)("derives the locale from %s", (path, locale) => {
    expect(getLocaleFromPath(path)).toBe(locale);
  });

  it.each([
    ["/", "/"],
    ["/en", "/"],
    ["/en/", "/"],
    ["/en/services", "/services"],
    ["/en/services/", "/services/"],
    ["/en/contact?from=nav#email", "/contact?from=nav#email"],
  ] as const)("strips an English prefix from %s", (path, expected) => {
    expect(stripLocalePrefix(path)).toBe(expected);
  });

  it.each([
    ["/", "en", "/en"],
    ["/services", "en", "/en/services"],
    ["/services/", "en", "/en/services/"],
    ["/en/services", "en", "/en/services"],
    ["/en/services/", "es", "/services/"],
    ["/contact?from=nav", "en", "/en/contact?from=nav"],
    ["/contact#email", "en", "/en/contact#email"],
    ["/en/contact?from=nav#email", "es", "/contact?from=nav#email"],
  ] as const)("localizes %s to %s", (path, locale, expected) => {
    expect(localizePath(path, locale)).toBe(expected);
  });

  it("resolves the now-available English contact page without losing query or fragment", () => {
    expect(getLocaleHref("/contact?from=nav#email", "en")).toBe(
      "/en/contact?from=nav#email",
    );
  });

  it("falls back to the available English landing page for an unregistered path", () => {
    expect(getLocaleHref("/politica-de-privacidad?from=nav#email", "en")).toBe(
      "/en?from=nav#email",
    );
  });

  it("returns to the matching Spanish path from an English path", () => {
    expect(getLocaleHref("/en/services/?from=nav#details", "es")).toBe(
      "/services/?from=nav#details",
    );
  });

  it("routes English service cards to the English service detail page", () => {
    expect(getServiceDetailHref("desarrollo-web-apps", "en")).toBe(
      "/en/services/web-app-development",
    );
  });

  it("keeps Spanish service cards on the Spanish detail route", () => {
    expect(getServiceDetailHref("desarrollo-web-apps", "es")).toBe(
      "/services/desarrollo-web-apps",
    );
  });

  it("falls back to the Spanish detail route for an unmapped slug in English", () => {
    expect(getServiceDetailHref("not-a-real-service", "en")).toBe(
      "/services/not-a-real-service",
    );
  });
});

describe("home section anchors", () => {
  it.each([
    ["services", "es", "servicios"],
    ["about", "es", "nosotros"],
    ["testimonials", "es", "testimonios"],
    ["contact", "es", "contacto"],
    ["services", "en", "services"],
    ["about", "en", "about"],
    ["testimonials", "en", "testimonials"],
    ["contact", "en", "contact"],
  ] as const)("maps %s/%s to the %s DOM id", (section, locale, id) => {
    expect(getHomeSectionId(section, locale)).toBe(id);
  });

  it.each([
    ["services", "es", true],
    ["about", "es", true],
    ["testimonials", "es", true],
    ["contact", "es", true],
    ["services", "en", true],
    ["about", "en", true],
    ["testimonials", "en", true],
    ["contact", "en", true],
  ] as const)("reports %s/%s availability as %s", (section, locale, available) => {
    expect(isHomeSectionAvailable(section, locale)).toBe(available);
  });

  it("builds the Spanish home-anchor href for an available section", () => {
    expect(getHomeSectionHref("about", "es")).toBe("/#nosotros");
  });

  it("builds the English home-anchor href for an available section", () => {
    expect(getHomeSectionHref("services", "en")).toBe("/en#services");
    expect(getHomeSectionHref("about", "en")).toBe("/en#about");
    expect(getHomeSectionHref("testimonials", "en")).toBe("/en#testimonials");
    expect(getHomeSectionHref("contact", "en")).toBe("/en#contact");
  });

  // Every home section is now registered for both locales, so there is no
  // real section/locale pair left to exercise the "unavailable" branch of
  // getHomeSectionId/getHomeSectionHref/isHomeSectionAvailable with live
  // data. That branch (and the getNavHref dead-end it feeds) is still
  // covered directly against a mocked routing module in
  // src/i18n/chrome/navigation.test.ts.
});

describe("getNavHref", () => {
  it("links to the translated page when that page exists for the locale", () => {
    expect(getNavHref("services", "/services", "es")).toBe("/services");
    expect(getNavHref("contact", "/contact", "es")).toBe("/contact");
    expect(getNavHref("services", "/services", "en")).toBe("/en/services");
  });

  it("links to the translated English contact page now that it is registered", () => {
    expect(getNavHref("contact", "/contact", "en")).toBe("/en/contact");
  });
});
