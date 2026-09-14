import { beforeEach, describe, expect, it, vi } from "vitest";

import { business } from "@/data/business";

const routingOverride = vi.hoisted(() => ({ forceDeadEnd: false }));

vi.mock("../routing", async () => {
  const actual = await vi.importActual<typeof import("../routing")>("../routing");
  return {
    ...actual,
    getNavHref: (
      section: Parameters<typeof actual.getNavHref>[0],
      path: string,
      locale: Parameters<typeof actual.getNavHref>[2],
    ) =>
      routingOverride.forceDeadEnd
        ? actual.localizePath("/", locale)
        : actual.getNavHref(section, path, locale),
  };
});

import { getContactNavLink } from "./navigation";

describe("getContactNavLink", () => {
  beforeEach(() => {
    routingOverride.forceDeadEnd = false;
  });

  it("links to the Spanish contact page as an internal link", () => {
    expect(getContactNavLink("es")).toEqual({
      href: "/contact",
      external: false,
    });
  });

  it("links to the English contact page now that it is registered", () => {
    expect(getContactNavLink("en")).toEqual({
      href: "/en/contact",
      external: false,
    });
  });

  it("falls back to WhatsApp while a locale has no contact destination", () => {
    routingOverride.forceDeadEnd = true;

    expect(getContactNavLink("en")).toEqual({
      href: business.whatsappUrl,
      external: true,
    });
  });
});
