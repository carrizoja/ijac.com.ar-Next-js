// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ServicesPage from "./page";

describe("services listing page copy", () => {
  it("writes Spanish headings and actions with their accents", () => {
    render(<ServicesPage />);

    expect(screen.getAllByRole("heading", { level: 3, name: "Qué incluye" })).toHaveLength(8);
    expect(
      screen.getByRole("heading", { level: 2, name: "¿Necesitas una solución a medida?" }),
    ).toBeInTheDocument();
  });

  it("lists the service scope as items instead of a dash-joined sentence", () => {
    const { container } = render(<ServicesPage />);
    const article = container.querySelector("article#ciberseguridad-proteccion-datos")!;
    const scopeHeading = within(article as HTMLElement).getByRole("heading", {
      level: 3,
      name: "Alcance del servicio",
    });
    const scopeList = scopeHeading.nextElementSibling!;

    expect(scopeList.tagName).toBe("UL");
    expect(within(scopeList as HTMLElement).getAllByRole("listitem")).toHaveLength(5);
    expect(scopeList.textContent).not.toContain(" - ");
  });
});

describe("services listing page CTA", () => {
  it("renders 'Hablar con iJac' with the same primary button as 'Ver página del servicio'", () => {
    render(<ServicesPage />);

    const cta = screen.getByRole("link", { name: "Hablar con iJac" });
    const [servicePageButton] = screen.getAllByRole("link", { name: "Ver página del servicio" });

    expect(cta).toHaveAttribute("href", "/contact");
    expect(cta.className).toBe(servicePageButton.className);
    expect(cta.innerHTML.replace(/Hablar con iJac/, "")).toBe(
      servicePageButton.innerHTML.replace(/Ver página del servicio/, ""),
    );
  });
});
