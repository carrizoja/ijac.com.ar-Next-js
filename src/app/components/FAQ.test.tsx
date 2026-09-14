// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { business } from "@/data/business";
import { FAQ } from "./FAQ";

describe("FAQ (default / Spanish)", () => {
  it("renders the Spanish heading and questions when no locale is given", () => {
    render(<FAQ />);

    expect(
      screen.getByRole("heading", { name: "Preguntas Frecuentes" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("¿Qué servicios de IT ofrece iJac?"),
    ).toBeInTheDocument();
  });

  it("publishes Spanish FAQPage JSON-LD by default", () => {
    const { container } = render(<FAQ />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent ?? "{}");

    expect(jsonLd.mainEntity[0].name).toBe("¿Qué servicios de IT ofrece iJac?");
  });
});

describe("FAQ (English)", () => {
  it("renders the English heading and questions", () => {
    render(<FAQ locale="en" />);

    expect(
      screen.getByRole("heading", { name: "Frequently Asked Questions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("What IT services does iJac offer?"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/¿/)).not.toBeInTheDocument();
  });

  it("interpolates business data into the visible English answers", () => {
    render(<FAQ locale="en" />);

    expect(screen.getByText(/Response time depends/)).toHaveTextContent(
      business.email,
    );
  });

  it("publishes English FAQPage JSON-LD, not the Spanish copy", () => {
    const { container } = render(<FAQ locale="en" />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent ?? "{}");

    expect(jsonLd.mainEntity).toHaveLength(4);
    expect(jsonLd.mainEntity[0].name).toBe("What IT services does iJac offer?");
    for (const entry of jsonLd.mainEntity) {
      expect(entry.name).not.toMatch(/[¿¡]/);
      expect(entry.acceptedAnswer.text).not.toMatch(/[¿¡]/);
    }
  });
});
