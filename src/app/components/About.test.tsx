// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("framer-motion", async () => {
  const ReactModule = await import("react");
  const animationProps = ["initial", "whileInView", "animate", "transition", "variants", "whileHover"];

  return {
    motion: new Proxy({} as Record<string, unknown>, {
      get: (_target, tag: string) => {
        const MotionComponent = ReactModule.forwardRef<HTMLElement, Record<string, unknown>>(
          (props, ref) => {
            const domProps = { ...props };
            for (const prop of animationProps) delete domProps[prop];
            return ReactModule.createElement(tag, { ...domProps, ref });
          },
        );
        MotionComponent.displayName = `motion.${tag}`;
        return MotionComponent;
      },
    }),
  };
});

vi.mock("./ui/hero-highlight", () => ({
  HeroHighlight: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Highlight: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock("./OurStaff", () => ({
  OurStaff: ({ locale }: { locale?: string }) => (
    <div data-testid="our-staff" data-locale={locale ?? "es"} />
  ),
}));

beforeAll(() => {
  class IntersectionObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // jsdom does not implement IntersectionObserver
  // @ts-expect-error test stub
  window.IntersectionObserver = IntersectionObserverMock;

  // The shared rAF stub in vitest.setup.ts always replays time 0, which spins
  // About's counter animation into infinite recursion. Advance a fake clock
  // instead so useCountAnimation reaches progress >= 1 in a few frames.
  let frame = 0;
  window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
    frame += 1;
    callback(frame * 1000);
    return frame;
  }) as typeof window.requestAnimationFrame;
});

import { About } from "./About";

describe("About", () => {
  it("renders the Spanish heading, mission, and stats copy by default", () => {
    render(<About />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Expertos en Transformación Digital" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Somos una empresa líder en desarrollo web y soporte técnico en Argentina"),
    ).toBeInTheDocument();

    const highlight = screen.getByText("iJac IT Solutions");
    expect(highlight.parentElement?.textContent).toBe(
      "En iJac IT Solutions, somos una empresa de software en Argentina con sede en Almagro, Buenos Aires,especializada en brindar soluciones informáticas que impulsen el crecimiento de tu negocio.",
    );

    expect(
      screen.getByText(
        "Nuestro equipo de especialistas trabaja para ofrecer servicios integrales, desde el diseño web hasta el soporte técnico en CABA, garantizando una consultoría IT de primer nivel adaptada al mercado argentino y regional.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("Proyectos Completados")).toBeInTheDocument();
    expect(screen.getByText("Satisfacción del Cliente")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Nuestra Misión" })).toBeInTheDocument();
    expect(screen.getByText("Innovación Constante")).toBeInTheDocument();
    expect(screen.getByText("Siempre a la vanguardia tecnológica")).toBeInTheDocument();
  });

  it("localizes the heading, mission, and stats copy for English", () => {
    render(<About locale="en" />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Experts in Digital Transformation" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("We are a leading web development and technical support company in Argentina"),
    ).toBeInTheDocument();

    const highlight = screen.getByText("iJac IT Solutions");
    expect(highlight.parentElement?.textContent).toBe(
      "At iJac IT Solutions, we are a software company in Argentina based in Almagro, Buenos Aires, specialized in delivering IT solutions that drive your business growth.",
    );

    expect(
      screen.getByText(
        "Our team of specialists works to deliver comprehensive services, from web design to technical support in CABA, ensuring first-class IT consulting tailored to the Argentine and regional market.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("Completed Projects")).toBeInTheDocument();
    expect(screen.getByText("Client Satisfaction")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Our Mission" })).toBeInTheDocument();
    expect(screen.getByText("Constant Innovation")).toBeInTheDocument();
    expect(screen.getByText("Always at the technological forefront")).toBeInTheDocument();
  });

  it("passes the active locale down to OurStaff", () => {
    render(<About locale="en" />);
    expect(screen.getByTestId("our-staff")).toHaveAttribute("data-locale", "en");
  });

  it("defaults OurStaff to Spanish when no locale is given", () => {
    render(<About />);
    expect(screen.getByTestId("our-staff")).toHaveAttribute("data-locale", "es");
  });

  it("keeps a single #nosotros anchor when composed the way the Spanish home page does", () => {
    const { container } = render(
      <section id="nosotros">
        <About />
      </section>,
    );

    expect(container.querySelectorAll("#nosotros")).toHaveLength(1);
  });
});
