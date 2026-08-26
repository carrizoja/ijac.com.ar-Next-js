import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  API_CONTRACT_VERSION,
  chatRequestSchema,
  chatResultCodeSchema,
  chatResponseSchema,
  supportedLanguages,
} from "./chat";

const validRequest = {
  apiVersion: "v1",
  question: "What services do you offer?",
  language: "en",
};

describe("versioned chatbot contracts", () => {
  it("accepts the one-question request and infers supported languages", () => {
    expect(chatRequestSchema.parse(validRequest)).toEqual(validRequest);
    expect(supportedLanguages).toEqual(["es", "en", "pt"]);
    expect(API_CONTRACT_VERSION).toBe("v1");
  });

  it.each([
    ["transcript", { transcript: [] }],
    ["history", { history: [] }],
    ["attachments", { attachments: [] }],
    ["streaming", { streaming: false }],
  ])("rejects %s and other extra request fields", (_name, extra) => {
    expect(() => chatRequestSchema.parse({ ...validRequest, ...extra })).toThrow();
  });

  it("rejects invalid versions, languages, question sizes, and unsafe source URLs", () => {
    expect(() => chatRequestSchema.parse({ ...validRequest, apiVersion: "v2" })).toThrow();
    expect(() => chatRequestSchema.parse({ ...validRequest, language: "fr" })).toThrow();
    expect(() => chatRequestSchema.parse({ ...validRequest, question: " " })).toThrow();
    expect(() =>
      chatRequestSchema.parse({ ...validRequest, question: "q".repeat(501) }),
    ).toThrow();
    for (const url of [
      "http://ijac.com.ar/services",
      "https://www.ijac.com.ar/services",
      "https://ijac.com.ar.evil.example/services",
      "https://user:password@ijac.com.ar/services",
      "https://ijac.com.ar:8443/services",
      "https://ijac.com.ar/services?source=chat",
      "https://ijac.com.ar/services#details",
    ]) {
      expect(() =>
        chatResponseSchema.parse({
          apiVersion: "v1",
          code: "SUCCESS",
          supported: true,
          answer: "Safe answer",
          language: "en",
          sources: [{ id: "services", title: "Services", url }],
        }),
      ).toThrow();
    }
  });

  it.each(supportedLanguages)("accepts a supported response in %s", (language) => {
    expect(
      chatResponseSchema.parse({
        apiVersion: "v1",
        code: "SUCCESS",
        supported: true,
        answer: "Safe answer",
        language,
        sources: [{ id: "services", title: "Services", url: "https://ijac.com.ar/services" }],
      }),
    ).toMatchObject({ code: "SUCCESS", supported: true, language });
  });

  it("rejects result codes outside the contract vocabulary", () => {
    expect(chatResultCodeSchema.parse("SUCCESS")).toBe("SUCCESS");
    expect(() => chatResultCodeSchema.parse("success")).toThrow();
    expect(() =>
      chatResponseSchema.parse({
        apiVersion: "v1",
        code: "NOT_A_RESULT",
        supported: false,
        language: "en",
      }),
    ).toThrow();
  });

  it.each([
    "UNKNOWN",
    "PROVIDER_UNAVAILABLE",
    "RATE_LIMITED",
    "DISABLED",
    "INVALID_REQUEST",
  ] as const)("requires a safe failure shape for %s", (code) => {
    const response = chatResponseSchema.parse({
      apiVersion: "v1",
      code,
      supported: false,
      language: "pt",
    });

    expect(response).toEqual({ apiVersion: "v1", code, supported: false, language: "pt" });
    expect(() =>
      chatResponseSchema.parse({
        ...response,
        answer: "This must not be emitted on failure",
      }),
    ).toThrow();
    expect(() =>
      chatResponseSchema.parse({
        ...response,
        sources: [{ id: "support", title: "Support" }],
      }),
    ).toThrow();
  });

  it("rejects response extras and incompatible response versions", () => {
    const response = {
      apiVersion: "v1",
      code: "UNKNOWN",
      supported: false,
      language: "en",
    };

    expect(() => chatResponseSchema.parse({ ...response, transcript: [] })).toThrow();
    expect(() => chatResponseSchema.parse({ ...response, apiVersion: "v2" })).toThrow();
    expect(() => chatResponseSchema.parse({ ...response, supported: true })).toThrow();
    expect(() =>
      chatResponseSchema.parse({
        apiVersion: response.apiVersion,
        code: "SUCCESS",
        supported: true,
        answer: "Missing language",
      }),
    ).toThrow();
  });
});

describe("frontend/server package boundary", () => {
  it("keeps server providers and Node-only imports out of contracts", () => {
    const root = resolve(import.meta.dirname, "../..");
    const rootManifest = JSON.parse(
      readFileSync(resolve(root, "package.json"), "utf8"),
    ) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string>; workspaces?: string[] };
    const contractManifest = JSON.parse(
      readFileSync(resolve(root, "packages/contracts/package.json"), "utf8"),
    ) as { dependencies?: Record<string, string> };
    const apiManifest = JSON.parse(
      readFileSync(resolve(root, "chat-api/package.json"), "utf8"),
    ) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    const source = readFileSync(resolve(root, "packages/contracts/chat.ts"), "utf8");
    const packageSource = readFileSync(resolve(root, "packages/contracts/package.json"), "utf8");

    expect(rootManifest.workspaces).toEqual(["packages/*", "chat-api"]);
    expect(rootManifest.dependencies ?? {}).not.toHaveProperty("zod");
    expect(rootManifest.dependencies ?? {}).not.toHaveProperty("groq-sdk");
    expect(rootManifest.dependencies ?? {}).not.toHaveProperty("@upstash/redis");
    expect(rootManifest.dependencies ?? {}).not.toHaveProperty("@ijac/chat-api");
    expect(rootManifest.devDependencies ?? {}).not.toHaveProperty("groq-sdk");
    expect(rootManifest.devDependencies ?? {}).not.toHaveProperty("@upstash/redis");
    expect(contractManifest.dependencies ?? {}).not.toHaveProperty("groq-sdk");
    expect(contractManifest.dependencies ?? {}).not.toHaveProperty("@upstash/redis");
    expect(apiManifest.dependencies ?? {}).not.toHaveProperty("groq-sdk");
    expect(apiManifest.dependencies ?? {}).not.toHaveProperty("@upstash/redis");
    expect(apiManifest.devDependencies ?? {}).not.toHaveProperty("groq-sdk");
    expect(apiManifest.devDependencies ?? {}).not.toHaveProperty("@upstash/redis");
    expect(packageSource).not.toMatch(/groq-sdk|@upstash\/redis/);
    expect(source).not.toMatch(/(?:from|require\(|import\s*\()[\s\S]{0,80}(?:node:|groq-sdk|@upstash\/)/);
    expect(source).not.toMatch(/(?:export\s+\*|export\s+\{)[\s\S]{0,80}(?:groq-sdk|@upstash\/)/);
  });
});
