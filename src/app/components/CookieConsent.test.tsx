// @vitest-environment jsdom

import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { pathnameRef } = vi.hoisted(() => ({ pathnameRef: { current: "/" } }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameRef.current,
}));

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const animationProps = ["initial", "animate", "exit", "transition", "whileHover", "whileTap"];

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    motion: new Proxy({} as Record<string, unknown>, {
      get: (_target, tag: string) => {
        const MotionComponent = React.forwardRef<HTMLElement, Record<string, unknown>>(
          (props, ref) => {
            const domProps = { ...props };
            for (const prop of animationProps) delete domProps[prop];
            return React.createElement(tag, { ...domProps, ref });
          },
        );
        MotionComponent.displayName = `motion.${tag}`;
        return MotionComponent;
      },
    }),
  };
});

import { CookieConsent } from "./CookieConsent";

const LEGAL_PAGE = "/terminos-y-condiciones";
const banner = () => screen.queryByText(/Uso de Cookies/);

describe("cookie consent banner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    pathnameRef.current = "/";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("appears after the delay when no consent is stored", () => {
    render(<CookieConsent />);
    expect(banner()).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(banner()).not.toBeNull();
  });

  it("stays hidden when consent was already given", () => {
    localStorage.setItem("cookie-consent", "accepted");
    render(<CookieConsent />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(banner()).toBeNull();
  });

  it("stays hidden on a legal page", () => {
    pathnameRef.current = LEGAL_PAGE;
    render(<CookieConsent />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(banner()).toBeNull();
  });

  it("does not fire a banner that was scheduled before navigating to a legal page", () => {
    const { rerender } = render(<CookieConsent />);

    // The banner is still pending its delay when the visitor opens the legal page.
    act(() => {
      vi.advanceTimersByTime(500);
    });
    pathnameRef.current = LEGAL_PAGE;
    rerender(<CookieConsent />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(banner()).toBeNull();
  });
});
