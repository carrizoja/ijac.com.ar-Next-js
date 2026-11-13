// @vitest-environment jsdom

import { act, fireEvent, render, screen } from "@testing-library/react";
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

function showBanner() {
  render(<CookieConsent />);

  act(() => {
    vi.advanceTimersByTime(1000);
  });
}

describe("cookie consent banner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    pathnameRef.current = "/";
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete (window as { gtag?: unknown }).gtag;
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

  it("stores an accepted choice and grants analytics storage", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    showBanner();

    fireEvent.click(screen.getByRole("button", { name: "Aceptar Cookies" }));

    expect(localStorage.getItem("cookie-consent")).toBe("accepted");
    expect(gtag).toHaveBeenCalledWith("consent", "update", { analytics_storage: "granted" });
  });

  it("stores a rejected choice and denies analytics storage", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    showBanner();

    fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));

    expect(localStorage.getItem("cookie-consent")).toBe("rejected");
    expect(gtag).toHaveBeenCalledWith("consent", "update", { analytics_storage: "denied" });
  });

  it("shows the banner instead of throwing when storage cannot be read", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });

    expect(() => showBanner()).not.toThrow();
    expect(banner()).not.toBeNull();
  });

  it("keeps analytics denied instead of throwing when the choice cannot be persisted", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    showBanner();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });

    expect(() => {
      fireEvent.click(screen.getByRole("button", { name: "Aceptar Cookies" }));
    }).not.toThrow();

    expect(gtag).toHaveBeenCalledWith("consent", "update", { analytics_storage: "denied" });
  });
});
