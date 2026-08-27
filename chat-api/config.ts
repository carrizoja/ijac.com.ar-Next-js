import { z } from "zod";

const exactOrigin = z
  .string()
  .trim()
  .min(1)
  .refine((value) => {
    if (value.includes("*")) return false;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && url.origin === value;
    } catch {
      return false;
    }
  }, "Origins must be exact https origins without wildcards, paths, or credentials");

const positiveInt = z.coerce.number().int().positive();

const envSchema = z.object({
  GROQ_API_KEY: z.string().trim().min(1),
  GROQ_MODEL: z.string().trim().min(1),
  CHAT_API_ENABLED: z.string().optional(),
  CHAT_API_ALLOWED_ORIGINS: z
    .string()
    .min(1)
    .transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean))
    .pipe(z.array(exactOrigin).min(1)),
  CHAT_API_CLIENT_KEY_SECRET: z.string().trim().min(1),
  CHAT_API_CLIENT_QUOTA: positiveInt,
  CHAT_API_GLOBAL_QUOTA: positiveInt,
  CHAT_API_QUOTA_WINDOW_SECONDS: positiveInt,
  CHAT_API_TIMEOUT_MS: positiveInt,
  CHAT_API_MAX_BYTES: positiveInt,
});

export interface ChatApiConfig {
  groqApiKey: string;
  groqModel: string;
  enabled: boolean;
  allowedOrigins: string[];
  clientKeySecret: string;
  clientQuota: number;
  globalQuota: number;
  quotaWindowSeconds: number;
  timeoutMs: number;
  maxRequestBytes: number;
}

export type RedactedChatApiConfig = Omit<ChatApiConfig, "groqApiKey" | "clientKeySecret">;

export type ChatApiConfigResult =
  | { ok: true; config: ChatApiConfig }
  | { ok: false; errors: string[] };

export function loadChatApiConfig(env: Record<string, string | undefined>): ChatApiConfigResult {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`),
    };
  }

  const values = parsed.data;
  return {
    ok: true,
    config: {
      groqApiKey: values.GROQ_API_KEY,
      groqModel: values.GROQ_MODEL,
      enabled: values.CHAT_API_ENABLED === "true",
      allowedOrigins: values.CHAT_API_ALLOWED_ORIGINS,
      clientKeySecret: values.CHAT_API_CLIENT_KEY_SECRET,
      clientQuota: values.CHAT_API_CLIENT_QUOTA,
      globalQuota: values.CHAT_API_GLOBAL_QUOTA,
      quotaWindowSeconds: values.CHAT_API_QUOTA_WINDOW_SECONDS,
      timeoutMs: values.CHAT_API_TIMEOUT_MS,
      maxRequestBytes: values.CHAT_API_MAX_BYTES,
    },
  };
}

/**
 * Diagnostics view. Fields are allowlisted explicitly rather than removed from a spread,
 * so a secret added to ChatApiConfig later cannot silently reach a log sink.
 */
export function redactConfig(config: ChatApiConfig): RedactedChatApiConfig {
  return {
    groqModel: config.groqModel,
    enabled: config.enabled,
    allowedOrigins: [...config.allowedOrigins],
    clientQuota: config.clientQuota,
    globalQuota: config.globalQuota,
    quotaWindowSeconds: config.quotaWindowSeconds,
    timeoutMs: config.timeoutMs,
    maxRequestBytes: config.maxRequestBytes,
  };
}
