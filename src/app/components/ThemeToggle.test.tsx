// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));

import { THEME_STORAGE_KEY } from "../lib/theme";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    navigation.pathname = "/";
    window.localStorage.clear();
    document.documentElement.classList.add("dark");
  });

  it("offers the light option while dark is active", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Cambiar a modo claro" })).toBeInTheDocument();
  });

  it("switches the document to light and remembers it", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Cambiar a modo claro" }));

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(screen.getByRole("button", { name: "Cambiar a modo oscuro" })).toBeInTheDocument();
  });

  it("switches back to dark", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Cambiar a modo claro" });
    fireEvent.click(button);
    fireEvent.click(screen.getByRole("button", { name: "Cambiar a modo oscuro" }));

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("localizes its accessible name on the English site", () => {
    navigation.pathname = "/en";
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
  });

  it("notifies the caller so a drawer can close", () => {
    const onToggle = vi.fn();
    render(<ThemeToggle onToggle={onToggle} />);
    fireEvent.click(screen.getByRole("button", { name: "Cambiar a modo claro" }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("reflects a returning visitor's stored light preference on mount", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");

    render(<ThemeToggle />);

    expect(screen.getByRole("button", { name: "Cambiar a modo oscuro" })).toBeInTheDocument();
  });

  it("keeps every mounted toggle in sync when one of them is clicked", () => {
    // The navbar and the drawer both mount a toggle at the same time, hidden
    // by CSS at different widths. Clicking either one must move both.
    render(
      <>
        <ThemeToggle />
        <ThemeToggle />
      </>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Cambiar a modo claro" })[0]);

    expect(screen.getAllByRole("button", { name: "Cambiar a modo oscuro" })).toHaveLength(2);
  });
});
