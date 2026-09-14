// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("swiper/react", () => ({
  Swiper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SwiperSlide: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("swiper/modules", () => ({
  Navigation: {},
  Pagination: {},
  A11y: {},
  EffectFlip: {},
  Autoplay: {},
}));

vi.mock("swiper/css", () => ({}));
vi.mock("swiper/css/navigation", () => ({}));
vi.mock("swiper/css/pagination", () => ({}));
vi.mock("swiper/css/scrollbar", () => ({}));
vi.mock("swiper/css/effect-flip", () => ({}));

import Testimonials from "./Testimonials";

describe("Testimonials", () => {
  it("renders the Spanish heading by default", () => {
    render(<Testimonials />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Lo que dicen nuestros clientes" }),
    ).toBeInTheDocument();
  });

  it("localizes the heading for English while leaving quoted reviews untouched", () => {
    render(<Testimonials locale="en" />);

    expect(
      screen.getByRole("heading", { level: 2, name: "What our clients say" }),
    ).toBeInTheDocument();
  });

  it("keeps the review chrome in Spanish by default", () => {
    render(<Testimonials />);

    expect(screen.getAllByText("Reseña de Google").length).toBeGreaterThan(0);
    expect(
      screen.getByLabelText(
        "Ver la reseña de Teresa Mazzinghi en Google (se abre en una pestaña nueva)",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByLabelText("5 de 5 estrellas").length).toBeGreaterThan(0);
  });

  it("localizes the review chrome for English", () => {
    render(<Testimonials locale="en" />);

    expect(screen.getAllByText("Google review").length).toBeGreaterThan(0);
    expect(
      screen.getByLabelText(
        "View Teresa Mazzinghi's review on Google (opens in a new tab)",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByLabelText("5 out of 5 stars").length).toBeGreaterThan(0);
    expect(screen.queryByText(/Reseña de/)).not.toBeInTheDocument();
  });
});
