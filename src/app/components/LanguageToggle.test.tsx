// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

import { LanguageToggle } from "./LanguageToggle";

describe("LanguageToggle", () => {
  beforeEach(() => {
    navigation.pathname = "/";
    window.history.replaceState({}, "", "/");
  });

  it("marks Spanish as current and preserves query and fragment in the English link", () => {
    window.history.replaceState({}, "", "/?campaign=spring#top");
    render(<LanguageToggle />);

    expect(screen.getByRole("group", { name: "Selector de idioma" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Idioma actual: Español" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Ver esta página en inglés" })).toHaveAttribute(
      "href",
      "/en?campaign=spring#top",
    );
  });

  it("falls back to the available English landing page from an untranslated route", () => {
    navigation.pathname = "/politica-de-privacidad";
    window.history.replaceState({}, "", "/politica-de-privacidad?from=nav#email");
    render(<LanguageToggle />);

    expect(screen.getByRole("link", { name: "Ver esta página en inglés" })).toHaveAttribute(
      "href",
      "/en?from=nav#email",
    );
  });

  it("links to the translated English contact page now that it is registered", () => {
    navigation.pathname = "/contact";
    window.history.replaceState({}, "", "/contact?from=nav#email");
    render(<LanguageToggle />);

    expect(screen.getByRole("link", { name: "Ver esta página en inglés" })).toHaveAttribute(
      "href",
      "/en/contact?from=nav#email",
    );
  });

  it("localizes its labels and marks English as current on the English route", () => {
    navigation.pathname = "/en";
    window.history.replaceState({}, "", "/en?campaign=spring#top");
    render(<LanguageToggle />);

    expect(screen.getByRole("group", { name: "Language selector" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Current language: English" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "View this page in Spanish" })).toHaveAttribute(
      "href",
      "/?campaign=spring#top",
    );
  });
});
