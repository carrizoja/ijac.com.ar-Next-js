// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("framer-motion", async () => {
  const ReactModule = await import("react");
  const animationProps = [
    "initial",
    "whileInView",
    "animate",
    "transition",
    "variants",
    "whileHover",
    "viewport",
  ];

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

import { OurStaff } from "./OurStaff";

describe("OurStaff", () => {
  it("renders the Spanish two-part heading and description by default", () => {
    render(<OurStaff />);

    expect(screen.getByText("Nuestro")).toBeInTheDocument();
    expect(screen.getByText("Equipo")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Un staff de profesionales especializados y comprometidos con la excelencia y la innovación tecnológica para hacer realidad tus proyectos.",
      ),
    ).toBeInTheDocument();
  });

  it("localizes the two-part heading and description for English", () => {
    render(<OurStaff locale="en" />);

    expect(screen.getByText("Our")).toBeInTheDocument();
    expect(screen.getByText("Team")).toBeInTheDocument();
    expect(
      screen.getByText(
        "A team of specialized professionals committed to excellence and technological innovation to bring your projects to life.",
      ),
    ).toBeInTheDocument();
  });
});
