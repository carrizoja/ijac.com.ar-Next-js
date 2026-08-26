import { z } from "zod";

export const API_CONTRACT_VERSION = "v1" as const;
export const supportedLanguages = ["es", "en", "pt"] as const;
export const chatResultCodes = [
  "SUCCESS",
  "UNKNOWN",
  "PROVIDER_UNAVAILABLE",
  "RATE_LIMITED",
  "DISABLED",
  "INVALID_REQUEST",
] as const;
export const chatResultCodeSchema = z.enum(chatResultCodes);

const safeSourceUrl = z
  .url()
  .refine((value) => {
    try {
      const url = new URL(value);
      return (
        url.protocol === "https:" &&
        url.hostname === "ijac.com.ar" &&
        url.port === "" &&
        url.username === "" &&
        url.password === "" &&
        url.search === "" &&
        url.hash === "" &&
        url.pathname.startsWith("/")
      );
    } catch {
      return false;
    }
  }, "Source URL must be an approved iJAC HTTPS URL");

const contractVersion = z.literal(API_CONTRACT_VERSION);
const language = z.enum(supportedLanguages);

export const chatRequestSchema = z
  .object({
    apiVersion: contractVersion,
    question: z.string().trim().min(1).max(500),
    language,
  })
  .strict();

export const chatSourceSchema = z
  .object({
    id: z.string().trim().min(1),
    title: z.string().trim().min(1),
    url: safeSourceUrl.optional(),
  })
  .strict();

const successResponseSchema = z
  .object({
    apiVersion: contractVersion,
    code: z.literal("SUCCESS"),
    supported: z.literal(true),
    answer: z.string().trim().min(1),
    language,
    sources: z.array(chatSourceSchema).max(3).optional(),
  })
  .strict();

const failureResponseCodes = [
  "UNKNOWN",
  "PROVIDER_UNAVAILABLE",
  "RATE_LIMITED",
  "DISABLED",
  "INVALID_REQUEST",
] as const;

const failureResponseSchemas = failureResponseCodes.map((code) =>
  z
    .object({
      apiVersion: contractVersion,
      code: z.literal(code),
      supported: z.literal(false),
      language,
    })
    .strict(),
);

const responseSchemas = [successResponseSchema, ...failureResponseSchemas] as const;

export const chatResponseSchema = z.discriminatedUnion("code", responseSchemas);

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatSource = z.infer<typeof chatSourceSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
export type ChatResultCode = z.infer<typeof chatResultCodeSchema>;
export type SupportedLanguage = z.infer<typeof language>;
