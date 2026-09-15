import { describe, expect, it } from "vitest";

import { business } from "@/data/business";

import { getWhatsAppUrl } from "./whatsapp";

describe("getWhatsAppUrl", () => {
  it("reproduces the established Spanish link exactly", () => {
    // Pins the helper against the hardcoded URL so the two cannot drift.
    expect(getWhatsAppUrl("es")).toBe(business.whatsappUrl);
  });

  it("greets English visitors in English", () => {
    const message = decodeURIComponent(
      new URL(getWhatsAppUrl("en")).searchParams.get("text") ?? "",
    );

    expect(message).toBe("Hi iJAC, I'd like to know more about your services");
  });

  it("reaches the same number in both locales", () => {
    const numberFor = (url: string) => new URL(url).pathname;

    expect(numberFor(getWhatsAppUrl("en"))).toBe(numberFor(getWhatsAppUrl("es")));
    expect(numberFor(getWhatsAppUrl("es"))).toBe(
      `/${business.phoneHref.replace(/\D/g, "")}`,
    );
  });
});
