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
});
