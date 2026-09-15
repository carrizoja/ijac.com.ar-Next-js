// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const animationProps = [
    "initial",
    "animate",
    "exit",
    "transition",
    "variants",
    "whileHover",
  ];

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    motion: new Proxy({} as Record<string, unknown>, {
      get: (_target, tag: string) => {
        const MotionComponent = React.forwardRef<HTMLElement, Record<string, unknown>>(
          (props, ref) => {
            const domProps = { ...props };
            for (const prop of animationProps) delete domProps[prop];
            return React.createElement(tag, { ...domProps, ref });
          },
        );
        MotionComponent.displayName = `motion.${tag}`;
        return MotionComponent;
      },
    }),
  };
});

import { HamburgerMenu } from "./HamburgerMenu";
import { NavbarIjac } from "./Navbarijac";

describe("primary navigation", () => {
  beforeEach(() => {
    navigation.pathname = "/";
  });

  it("links desktop visitors directly to Contact without an FAQ item", () => {
    render(<NavbarIjac />);

    expect(screen.queryByRole("link", { name: "FAQ" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contacto" })).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(screen.getByRole("group", { name: "Selector de idioma" })).toBeInTheDocument();
  });

  it("exposes Spanish home-anchor hrefs for About and Testimonials", () => {
    render(<NavbarIjac />);

    expect(screen.getByRole("link", { name: "Nosotros" })).toHaveAttribute(
      "href",
      "/#nosotros",
    );
    expect(screen.getByRole("link", { name: "Testimonios" })).toHaveAttribute(
      "href",
      "/#testimonios",
    );
  });

  it("links mobile visitors directly to Contact without an FAQ item", () => {
    render(<HamburgerMenu />);

    const menuButton = screen.getByRole("button", {
      name: "Abrir menú de navegación",
    });
    fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.queryByText("FAQ")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contacto" })).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(screen.getByRole("group", { name: "Selector de idioma" })).toBeInTheDocument();
  });

  it("offers the theme toggle on the desktop navbar", () => {
    render(<NavbarIjac />);
    expect(
      screen.getByRole("button", { name: "Cambiar a modo claro" }),
    ).toBeInTheDocument();
  });

  it("offers the theme toggle in the mobile drawer", () => {
    render(<HamburgerMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir menú de navegación" }));
    expect(
      screen.getByRole("button", { name: "Cambiar a modo claro" }),
    ).toBeInTheDocument();
  });
});

describe("English primary navigation", () => {
  beforeEach(() => {
    navigation.pathname = "/en";
  });

  it("renders English labels and localized hrefs on the desktop navbar", () => {
    render(<NavbarIjac />);

    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute(
      "href",
      "/en/services",
    );
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/en#about",
    );
    expect(screen.getByRole("link", { name: "Testimonials" })).toHaveAttribute(
      "href",
      "/en#testimonials",
    );
    const contact = screen.getByRole("link", { name: "Contact" });
    expect(contact).toHaveAttribute("href", "/en/contact");
    expect(contact).not.toHaveAttribute("target");
    expect(screen.queryByText("Servicios")).not.toBeInTheDocument();
    expect(screen.queryByText("Nosotros")).not.toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Language selector" }),
    ).toBeInTheDocument();
  });

  it("does not leak Spanish section anchors into the desktop navbar", () => {
    render(<NavbarIjac />);

    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));

    for (const href of hrefs) {
      // Only the anchor fragment matters here: an external link may legitimately
      // carry Spanish words inside its query string (the WhatsApp prefilled message).
      const fragment = (href?.startsWith("/") ? href.split("#")[1] : "") ?? "";
      expect(fragment).not.toMatch(/^(nosotros|testimonios|servicios|contacto)$/);
    }
  });

  it("renders English labels and localized hrefs on the mobile menu", () => {
    render(<HamburgerMenu />);

    const menuButton = screen.getByRole("button", {
      name: "Open navigation menu",
    });
    fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute(
      "href",
      "/en/services",
    );
    expect(screen.getByRole("button", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Testimonials" })).toBeInTheDocument();
    const contact = screen.getByRole("link", { name: "Contact" });
    expect(contact).toHaveAttribute("href", "/en/contact");
    expect(contact).not.toHaveAttribute("target");
    expect(screen.queryByText("Nosotros")).not.toBeInTheDocument();
    expect(screen.queryByText("Testimonios")).not.toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Language selector" }),
    ).toBeInTheDocument();
  });
});
