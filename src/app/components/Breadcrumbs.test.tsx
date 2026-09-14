// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Breadcrumbs } from "./Breadcrumbs";

const items = [
  { name: "Home", href: "/" },
  { name: "Contact", href: "/contact" },
];

describe("Breadcrumbs (default / Spanish)", () => {
  it("titles the link 'Ir a <name>' when no locale is given", () => {
    render(<Breadcrumbs items={items} />);

    expect(screen.getByTitle("Ir a Home")).toBeInTheDocument();
  });

  it("keeps the aria-label and BreadcrumbList JSON-LD unchanged", () => {
    const { container } = render(<Breadcrumbs items={items} />);

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent ?? "{}");
    expect(jsonLd.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ijac.com.ar/" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Contact",
        item: "https://ijac.com.ar/contact",
      },
    ]);
  });
});

describe("Breadcrumbs (English)", () => {
  it("titles the link 'Go to <name>'", () => {
    render(<Breadcrumbs items={items} locale="en" />);

    expect(screen.getByTitle("Go to Home")).toBeInTheDocument();
    expect(screen.queryByTitle("Ir a Home")).not.toBeInTheDocument();
  });
});
