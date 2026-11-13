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
import { requestConsentWithdrawal } from "../lib/consent";

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
    delete window.__ijacExpireAnalyticsCookies;
  });

  it("keeps the Spanish copy unchanged on Spanish pages", () => {
    showBanner();

    expect(screen.getByRole("heading", { name: "🍪 Uso de Cookies" })).not.toBeNull();
    expect(screen.getByText(/Este sitio web utiliza/).textContent).toBe(
      "Este sitio web utiliza cookies propias y de terceros para mejorar su experiencia de navegación, " +
        "analizar el tráfico del sitio y personalizar el contenido. Al continuar navegando, acepta nuestros " +
        "Términos y Condiciones y nuestra Política de Privacidad.",
    );
    expect(screen.getByRole("button", { name: "Rechazar" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Aceptar Cookies" })).not.toBeNull();
  });

  it("shows English copy on English pages and keeps the Spanish legal links", () => {
    pathnameRef.current = "/en/";
    showBanner();

    expect(screen.getByRole("heading", { name: "🍪 Use of Cookies" })).not.toBeNull();
    expect(screen.queryByText(/Uso de Cookies/)).toBeNull();
    expect(screen.getByRole("link", { name: "Terms and Conditions" }).getAttribute("href")).toBe(
      "/terminos-y-condiciones",
    );
    expect(screen.getByRole("link", { name: "Privacy Policy" }).getAttribute("href")).toBe(
      "/politica-de-privacidad",
    );
    expect(screen.getByRole("button", { name: "Reject" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Accept Cookies" })).not.toBeNull();
  });

  it("stores and applies an English accept", () => {
    pathnameRef.current = "/en/services/";
    const gtag = vi.fn();
    window.gtag = gtag;
    showBanner();

    fireEvent.click(screen.getByRole("button", { name: "Accept Cookies" }));

    expect(localStorage.getItem("cookie-consent")).toBe("accepted");
    expect(gtag).toHaveBeenCalledWith("consent", "update", { analytics_storage: "granted" });
  });

  it("stores and applies an English reject", () => {
    pathnameRef.current = "/en/";
    const gtag = vi.fn();
    const expire = vi.fn();
    window.gtag = gtag;
    window.__ijacExpireAnalyticsCookies = expire;
    showBanner();

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    expect(localStorage.getItem("cookie-consent")).toBe("rejected");
    expect(gtag).toHaveBeenCalledWith("consent", "update", { analytics_storage: "denied" });
    expect(expire).toHaveBeenCalledTimes(1);
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

  it("removes analytics cookies when a visitor rejects", () => {
    const expire = vi.fn();
    window.__ijacExpireAnalyticsCookies = expire;
    showBanner();

    fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));

    expect(expire).toHaveBeenCalledTimes(1);
  });

  it("leaves analytics cookies alone when a visitor accepts", () => {
    const expire = vi.fn();
    window.__ijacExpireAnalyticsCookies = expire;
    showBanner();

    fireEvent.click(screen.getByRole("button", { name: "Aceptar Cookies" }));

    expect(expire).not.toHaveBeenCalled();
  });

  it("withdraws consent and brings the banner back for an accepted visitor", () => {
    localStorage.setItem("cookie-consent", "accepted");
    localStorage.setItem("cookie-consent-date", "2026-11-13T15:00:00.000Z");
    const gtag = vi.fn();
    const expire = vi.fn();
    window.gtag = gtag;
    window.__ijacExpireAnalyticsCookies = expire;
    render(<CookieConsent />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(banner()).toBeNull();

    act(() => {
      requestConsentWithdrawal();
    });

    expect(gtag).toHaveBeenCalledWith("consent", "update", { analytics_storage: "denied" });
    expect(expire).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("cookie-consent")).toBeNull();
    expect(localStorage.getItem("cookie-consent-date")).toBeNull();
    expect(banner()).not.toBeNull();

    // The loop closes: the visitor can accept again from the restored banner.
    fireEvent.click(screen.getByRole("button", { name: "Aceptar Cookies" }));

    expect(localStorage.getItem("cookie-consent")).toBe("accepted");
    expect(gtag).toHaveBeenCalledWith("consent", "update", { analytics_storage: "granted" });
  });

  it("shows the banner on a legal page when the visitor asks to withdraw", () => {
    localStorage.setItem("cookie-consent", "accepted");
    pathnameRef.current = LEGAL_PAGE;
    render(<CookieConsent />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(banner()).toBeNull();

    act(() => {
      requestConsentWithdrawal();
    });

    expect(banner()).not.toBeNull();
  });

  it("withdraws without throwing when the stored choice cannot be removed", () => {
    localStorage.setItem("cookie-consent", "accepted");
    const gtag = vi.fn();
    const expire = vi.fn();
    window.gtag = gtag;
    window.__ijacExpireAnalyticsCookies = expire;
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });

    expect(() => {
      act(() => {
        requestConsentWithdrawal();
      });
    }).not.toThrow();

    expect(gtag).toHaveBeenCalledWith("consent", "update", { analytics_storage: "denied" });
    expect(expire).toHaveBeenCalledTimes(1);
    expect(banner()).not.toBeNull();
  });
});
