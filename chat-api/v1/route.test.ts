import { describe, expect, it, vi } from "vitest";
import { clientAddressFrom, createChatRoute, type ChatRouteHandler } from "./route";

function route(handler = vi.fn<ChatRouteHandler>(async () => ({
  status: 200,
  headers: { Vary: "Origin", "Access-Control-Allow-Origin": "https://ijac.com.ar" },
  body: { apiVersion: "v1", code: "UNKNOWN", supported: false, language: "en" },
}))) {
  return { handle: createChatRoute(handler), handler };
}

function post(body: string, headers: Record<string, string> = {}) {
  return new Request("https://api.ijac.com.ar/v1/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://ijac.com.ar",
      "x-forwarded-for": "203.0.113.7, 70.41.3.18",
      ...headers,
    },
    body,
  });
}

const validBody = JSON.stringify({ apiVersion: "v1", question: "What services?", language: "en" });

describe("chat route request extraction", () => {
  it("passes the method, origin, content type, and raw body to the handler", async () => {
    const { handle, handler } = route();
    await handle(post(validBody));

    expect(handler.mock.calls[0][0]).toEqual({
      method: "POST",
      origin: "https://ijac.com.ar",
      contentType: "application/json",
      body: validBody,
    });
  });

  it("reports a missing origin as null rather than an empty string", async () => {
    const request = new Request("https://api.ijac.com.ar/v1/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: validBody,
    });
    const { handle, handler } = route();
    await handle(request);

    expect(handler.mock.calls[0][0]).toMatchObject({ origin: null });
  });

  it("forwards a preflight without reading a body", async () => {
    const { handle, handler } = route();
    await handle(new Request("https://api.ijac.com.ar/v1/chat", {
      method: "OPTIONS",
      headers: { origin: "https://ijac.com.ar" },
    }));

    expect(handler.mock.calls[0][0]).toMatchObject({ method: "OPTIONS", body: "" });
  });
});

describe("chat route client address", () => {
  it("takes the first hop of x-forwarded-for", () => {
    expect(clientAddressFrom(new Headers({ "x-forwarded-for": "203.0.113.7, 70.41.3.18" })))
      .toBe("203.0.113.7");
  });

  it("trims surrounding whitespace", () => {
    expect(clientAddressFrom(new Headers({ "x-forwarded-for": "  203.0.113.7  " })))
      .toBe("203.0.113.7");
  });

  it("falls back to a constant when no forwarded header is present", () => {
    expect(clientAddressFrom(new Headers())).toBe("unknown");
  });

  it("never returns an empty address, so quota keys stay well formed", () => {
    expect(clientAddressFrom(new Headers({ "x-forwarded-for": "" }))).toBe("unknown");
  });
});

describe("chat route response", () => {
  it("serializes the handler body as JSON with its status", async () => {
    const { handle } = route();
    const response = await handle(post(validBody));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(await response.json()).toEqual({
      apiVersion: "v1",
      code: "UNKNOWN",
      supported: false,
      language: "en",
    });
  });

  it("copies the handler CORS headers onto the response", async () => {
    const { handle } = route();
    const response = await handle(post(validBody));

    expect(response.headers.get("vary")).toBe("Origin");
    expect(response.headers.get("access-control-allow-origin")).toBe("https://ijac.com.ar");
  });

  it("returns an empty 204 for a preflight", async () => {
    const handler = vi.fn<ChatRouteHandler>(async () => ({
      status: 204,
      headers: { Vary: "Origin" },
    }));
    const { handle } = route(handler);
    const response = await handle(post(validBody));

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
  });

  it("never echoes the client address or telemetry back to the caller", async () => {
    const handler = vi.fn<ChatRouteHandler>(async () => ({
      status: 200,
      headers: { Vary: "Origin" },
      body: { apiVersion: "v1", code: "UNKNOWN", supported: false, language: "en" },
      telemetry: {
        outcome: "UNKNOWN",
        sourceIds: ["managed-it-support"],
        language: "en",
        latencyBand: "fast",
        errorCategory: null,
      },
    }));
    const { handle } = route(handler);
    const response = await handle(post(validBody));
    const text = await response.text();

    expect(text).not.toContain("203.0.113.7");
    expect(text).not.toContain("latencyBand");
    expect(text).not.toContain("managed-it-support");
  });
});
