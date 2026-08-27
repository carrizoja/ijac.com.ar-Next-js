import {
  API_CONTRACT_VERSION,
  chatResponseSchema,
  type ChatResponse,
  type SupportedLanguage,
} from "@ijac/contracts/chat";

export interface ChatApiClient {
  ask(
    question: string,
    language: SupportedLanguage,
    signal?: AbortSignal,
  ): Promise<ChatResponse>;
}

/** The only shape shown when the API cannot be trusted or reached. */
function unknownResponse(language: SupportedLanguage): ChatResponse {
  return { apiVersion: API_CONTRACT_VERSION, code: "UNKNOWN", supported: false, language };
}

function isAbort(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

/**
 * Client for the isolated chat API.
 *
 * Every response is re-validated against the shared contract before it is trusted, so a
 * compromised or misbehaving endpoint cannot inject fields the UI would render. Failures
 * collapse to a localized UNKNOWN — the underlying cause is never surfaced to the visitor.
 */
export function createChatApiClient(
  baseUrl: string,
  fetchImpl: typeof fetch = fetch,
): ChatApiClient {
  const endpoint = `${baseUrl.replace(/\/+$/, "")}/v1/chat`;

  return {
    async ask(question, language, signal) {
      let payload: unknown;

      try {
        const response = await fetchImpl(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ apiVersion: API_CONTRACT_VERSION, question, language }),
          signal,
        });
        payload = await response.json();
      } catch (error) {
        // An abort is the caller dropping the turn, not a failure to report.
        if (isAbort(error)) throw error;
        return unknownResponse(language);
      }

      const parsed = chatResponseSchema.safeParse(payload);
      return parsed.success ? parsed.data : unknownResponse(language);
    },
  };
}
