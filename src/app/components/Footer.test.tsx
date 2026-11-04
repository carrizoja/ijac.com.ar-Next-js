// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

import Footer from "./Footer";

describe("Footer", () => {
  beforeEach(() => {
    navigation.pathname = "/";
  });

  it("renders the Spanish copyright and social titles on the Spanish site", () => {
    render(<Footer />);

    const year = new Date().getFullYear();
    expect(
      screen.getByText(`© ${year} iJac. Todos los derechos reservados.`),
    ).toBeInTheDocument();
    expect(screen.getByTitle("Seguinos en Instagram")).toBeInTheDocument();
    expect(screen.getByTitle("Seguinos en Facebook")).toBeInTheDocument();
    expect(
      screen.getByTitle("Visitar portafolio de José Carrizo"),
    ).toBeInTheDocument();
  });

  it("renders the English copyright and social titles on the English site", () => {
    navigation.pathname = "/en";
    render(<Footer />);

    const year = new Date().getFullYear();
    expect(
      screen.getByText(`© ${year} iJac. All rights reserved.`),
    ).toBeInTheDocument();
    expect(screen.getByTitle("Follow us on Instagram")).toBeInTheDocument();
    expect(screen.getByTitle("Follow us on Facebook")).toBeInTheDocument();
    expect(
      screen.getByTitle("Visit José Carrizo's portfolio"),
    ).toBeInTheDocument();
  });

  it("renders local NAP information and internal links to all services including PC Gamer", () => {
    render(<Footer />);

    expect(screen.getByText(/Colombres 195, Almagro, CABA/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Armado de PC Gamer y Consultoría de Hardware en Almagro - CABA",
      }),
    ).toHaveAttribute("href", "/services/armado-pcs-hardware");
  });
});
