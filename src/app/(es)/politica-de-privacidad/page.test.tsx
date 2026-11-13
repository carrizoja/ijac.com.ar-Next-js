// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PoliticaDePrivacidad from "./page";

function cookieSection() {
  render(<PoliticaDePrivacidad />);
  const heading = screen.getByRole("heading", { level: 2, name: /Cookies y Consentimiento/ });
  return heading.closest("section") as HTMLElement;
}

describe("privacy policy cookie section", () => {
  it("names the analytics tool and its consent mode", () => {
    const text = cookieSection().textContent ?? "";

    expect(text).toContain("G-8NYPRQK16F");
    expect(text).toContain("modo de consentimiento de Google (Consent Mode v2) en su modalidad avanzada");
  });

  it("states that storage is denied by default and only analytics can be granted", () => {
    const text = cookieSection().textContent ?? "";

    expect(text).toContain("analytics_storage");
    for (const key of ["ad_storage", "ad_user_data", "ad_personalization"]) {
      expect(text).toContain(key);
    }
    expect(text).toMatch(/nunca se habilitan/);
  });

  it("lists the analytics cookies and when they are written or removed", () => {
    const section = cookieSection();
    const text = section.textContent ?? "";

    expect(within(section).getAllByText(/_ga_\*/).length).toBeGreaterThan(0);
    expect(text).toMatch(/solo después de que usted acepta/);
    expect(text).toMatch(/se eliminan/);
  });

  it("says plainly that declining still sends cookieless pings", () => {
    const text = cookieSection().textContent ?? "";

    expect(text).toMatch(/sin cookies/);
    expect(text).not.toMatch(/ningún dato sale/i);
  });

  it("explains how to change the choice and where it is stored", () => {
    const text = cookieSection().textContent ?? "";

    expect(text).toContain("Configurar cookies");
    expect(text).toContain("cookie-consent");
    expect(text).toContain("cookie-consent-date");
    expect(text).toMatch(/almacenamiento local/);
  });

  it("keeps the later sections numbered after the new one", () => {
    render(<PoliticaDePrivacidad />);
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent?.trim());

    expect(headings).toEqual([
      "1. Información que Recopilamos",
      "2. Cómo Utilizamos su Información",
      "3. Uso de Google Analytics",
      "4. Cookies y Consentimiento",
      "5. Sus Derechos",
      "6. Seguridad de los Datos",
      "7. Retención de Datos",
      "8. Contacto para Asuntos de Privacidad",
    ]);
  });
});
