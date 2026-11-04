// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ServicesPage from "./page";

describe("services listing page CTA", () => {
  it("renders 'Hablar con iJac' with the same primary button as 'Ver pagina del servicio'", () => {
    render(<ServicesPage />);

    const cta = screen.getByRole("link", { name: "Hablar con iJac" });
    const [servicePageButton] = screen.getAllByRole("link", { name: "Ver pagina del servicio" });

    expect(cta).toHaveAttribute("href", "/contact");
    expect(cta.className).toBe(servicePageButton.className);
    expect(cta.innerHTML.replace(/Hablar con iJac/, "")).toBe(
      servicePageButton.innerHTML.replace(/Ver pagina del servicio/, ""),
    );
  });
});
