// @vitest-environment jsdom

import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  CONSENT_ACCEPTED,
  CONSENT_REJECTED,
  CONSENT_STORAGE_KEY,
  consentBootstrapScript,
} from "./consent";

type GtagCommand = unknown[];

function resetGlobals() {
  vi.restoreAllMocks();
  delete (window as { dataLayer?: unknown }).dataLayer;
  delete (window as { gtag?: unknown }).gtag;
  localStorage.clear();
}

/** Runs the inline bootstrap exactly as a browser would, then reads dataLayer. */
function runBootstrap(): GtagCommand[] {
  new Function(consentBootstrapScript)();
  const layer = (window as unknown as { dataLayer: ArrayLike<unknown> }).dataLayer;
  return Array.from(layer, (entry) => Array.from(entry as ArrayLike<unknown>));
}

describe("consentBootstrapScript", () => {
  beforeEach(resetGlobals);

  it("declares every storage type denied before anything else when nothing is stored", () => {
    const commands = runBootstrap();

    expect(commands).toHaveLength(1);
    expect(commands[0]).toEqual([
      "consent",
      "default",
      {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      },
    ]);
  });

  it("grants analytics after the default when the stored choice is accepted", () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, CONSENT_ACCEPTED);

    const commands = runBootstrap();

    expect(commands).toHaveLength(2);
    expect(commands[1]).toEqual(["consent", "update", { analytics_storage: "granted" }]);
  });

  it("leaves analytics denied when the stored choice is anything else", () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "rejected");

    const commands = runBootstrap();

    expect(commands).toHaveLength(1);
    expect(commands.some((command) => command[1] === "update")).toBe(false);
  });

  it("keeps the denied default when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });

    let commands: GtagCommand[] = [];
    expect(() => {
      commands = runBootstrap();
    }).not.toThrow();

    expect(commands).toHaveLength(1);
    expect(commands[0][1]).toBe("default");
  });

  it("defines window.gtag so a click before GA loads can queue", () => {
    runBootstrap();

    expect(typeof window.gtag).toBe("function");
  });
});

describe("legacy analytics cookies", () => {
  const GA_COOKIE = /^_ga(_[^=]*)?=/;

  function setCookie(name: string, value: string) {
    document.cookie = `${name}=${value}; path=/`;
  }

  function gaCookies() {
    return document.cookie.split("; ").filter((cookie) => GA_COOKIE.test(cookie));
  }

  function clearCookies() {
    for (const cookie of document.cookie.split("; ")) {
      const name = cookie.split("=")[0];
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  }

  beforeEach(() => {
    resetGlobals();
    clearCookies();
  });

  afterEach(clearCookies);

  it.each([
    ["rejected", CONSENT_REJECTED],
    ["absent", null],
  ])("expires cookies left by an earlier visit when the choice is %s", (_label, stored) => {
    if (stored) localStorage.setItem(CONSENT_STORAGE_KEY, stored);
    setCookie("_ga", "GA1.1.111111111.2222222222");
    setCookie("_ga_8NYPRQK16F", "GS2.1.s1$o1$g0");

    runBootstrap();

    expect(gaCookies()).toEqual([]);
  });

  it("leaves unrelated cookies alone while clearing _ga cookies", () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, CONSENT_REJECTED);
    setCookie("_ga", "GA1.1.111111111.2222222222");
    setCookie("_gid", "GA1.2.333333333.4444444444");

    runBootstrap();

    expect(gaCookies()).toEqual([]);
    expect(document.cookie).toContain("_gid=");
  });

  it("keeps analytics cookies when the visitor accepted", () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, CONSENT_ACCEPTED);
    setCookie("_ga", "GA1.1.111111111.2222222222");

    runBootstrap();

    expect(gaCookies()).toHaveLength(1);
  });
});
