// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  pathname: "/",
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ replace: navigation.replace }),
}));

import { ClientRedirect } from "./ClientRedirect";

function visit(pathname: string) {
  navigation.pathname = pathname;
  render(<ClientRedirect />);
  return navigation.replace.mock.calls.at(-1)?.[0];
}

describe("ClientRedirect", () => {
  beforeEach(() => {
    navigation.replace.mockClear();
  });

  describe("Spanish legacy paths", () => {
    it.each([
      ["/servicios", "/services"],
      ["/contacto", "/contact"],
      ["/inicio", "/"],
      ["/home", "/"],
    ])("sends %s to %s", (from, to) => {
      expect(visit(from)).toBe(to);
    });

    it.each([
      ["/about", "/#nosotros"],
      ["/nosotros", "/#nosotros"],
      ["/testimonials", "/#testimonios"],
      ["/testimonios", "/#testimonios"],
      ["/faq", "/contact"],
    ])("sends %s to the Spanish section anchor %s", (from, to) => {
      expect(visit(from)).toBe(to);
    });
  });

  describe("English legacy paths", () => {
    it.each([
      ["/en/servicios", "/en/services"],
      ["/en/contacto", "/en/contact"],
      ["/en/inicio", "/en"],
      ["/en/home", "/en"],
    ])("keeps %s inside English, landing on %s", (from, to) => {
      expect(visit(from)).toBe(to);
    });

    it("sends /en/about to the English section anchor", () => {
      expect(visit("/en/about")).toBe("/en#about");
    });

    it("sends an English visitor on a stale extension to the English home", () => {
      expect(visit("/en/servicios.html")).toBe("/en/services");
      expect(visit("/en/legacy.php")).toBe("/en");
    });

    it("sends English WordPress leftovers to the English home", () => {
      expect(visit("/en/wp-admin")).toBe("/en");
    });
  });

  describe("unchanged behaviour", () => {
    it("sends Spanish WordPress leftovers to the Spanish home", () => {
      expect(visit("/wp-admin")).toBe("/");
    });

    it("resolves a known path that still carries a trailing slash", () => {
      expect(visit("/servicios/")).toBe("/services");
    });

    it("leaves a real route alone", () => {
      visit("/services");
      expect(navigation.replace).not.toHaveBeenCalled();
    });

    it("leaves the English home alone", () => {
      visit("/en");
      expect(navigation.replace).not.toHaveBeenCalled();
    });
  });
});
