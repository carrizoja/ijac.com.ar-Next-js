// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { business } from "../../data/business";
import { RemoteSupportBanner } from "./RemoteSupportBanner";

describe("RemoteSupportBanner", () => {
  it("communicates professional TeamViewer support with broad availability", () => {
    render(<RemoteSupportBanner />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Asistencia remota con TeamViewer, estés donde estés/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/licencias profesionales de TeamViewer/i)).toBeInTheDocument();
    expect(screen.getByText(/sin importar la ciudad o el país/i)).toBeInTheDocument();
  });

  it("links the support CTA to the established WhatsApp destination", () => {
    render(<RemoteSupportBanner />);

    const cta = screen.getByRole("link", { name: /consultar por soporte remoto/i });
    expect(cta).toHaveAttribute("href", business.whatsappUrl);
    expect(cta).toHaveAttribute("target", "_blank");
    expect(cta).toHaveAttribute("rel", "noopener noreferrer");
  });
});
