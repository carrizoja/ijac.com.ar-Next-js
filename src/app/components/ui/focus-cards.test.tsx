// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FocusCards } from "./focus-cards";

const cards = [
  {
    slug: "ciberseguridad-proteccion-datos",
    title: "Ciberseguridad y Protección de Datos para Empresas",
    src: "/security.jpg",
    desc: "Protección para equipos y redes.",
    alt: "Equipo protegido",
  },
  {
    slug: "desarrollo-web-apps",
    title: "Desarrollo de Sitios Web y Aplicaciones Móviles",
    src: "/development.jpg",
    desc: "Sitios y aplicaciones a medida.",
    alt: "Aplicación web",
  },
  {
    slug: "soporte-tecnico-pc-mac-apple",
    title: "Soporte Técnico para PC, Mac y Apple en Almagro - CABA",
    src: "/support.jpg",
    desc: "Asistencia técnica para equipos Windows y Apple.",
    alt: "Soporte técnico",
  },
  {
    slug: "redes-wifi-cableado",
    title: "Instalación de Redes WiFi y Cableado Estructurado",
    src: "/networks.jpg",
    desc: "Redes estables para oficinas, locales y hogares.",
    alt: "Redes WiFi",
  },
];

describe("FocusCards", () => {
  it("renders every card as a descriptive link to its service detail page", () => {
    render(<FocusCards cards={cards} />);

    for (const card of cards) {
      expect(screen.getByRole("link", { name: card.title })).toHaveAttribute(
        "href",
        `/services/${card.slug}`,
      );
    }
  });

  it("reveals card details when the link receives keyboard focus", () => {
    render(<FocusCards cards={cards} />);

    const link = screen.getByRole("link", { name: cards[0].title });
    const details = screen.getByText(cards[0].desc).parentElement?.parentElement;

    expect(details).toHaveClass("opacity-0");
    fireEvent.focus(link);
    expect(details).toHaveClass("opacity-100");
    expect(link).toHaveClass("focus-visible:ring-4");
  });
});
