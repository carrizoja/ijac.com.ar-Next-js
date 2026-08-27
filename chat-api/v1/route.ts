import type { RawChatRequest } from "../cors";
import type { ChatHttpResponse } from "./chat";

/** Used when no forwarded address is present, so quota keys are always well formed. */
const UNKNOWN_ADDRESS = "unknown";

export type ChatRouteHandler = (raw: RawChatRequest) => Promise<ChatHttpResponse>;

/**
 * First hop of x-forwarded-for. The value is only ever fed to the HMAC in
 * controls.deriveClientKey — it is never stored, logged, or returned.
 */
export function clientAddressFrom(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (!forwarded) return UNKNOWN_ADDRESS;
  return forwarded.split(",")[0].trim() || UNKNOWN_ADDRESS;
}

/**
 * Adapts the Web Request/Response pair to the transport-free handler.
 * Only the response body and headers cross back out; telemetry stays server-side.
 */
export function createChatRoute(handle: ChatRouteHandler) {
  return async (request: Request): Promise<Response> => {
    const raw: RawChatRequest = {
      method: request.method,
      origin: request.headers.get("origin"),
      contentType: request.headers.get("content-type"),
      body: request.method === "OPTIONS" ? "" : await request.text(),
    };

    const result = await handle(raw);

    if (result.body === undefined) {
      return new Response(null, { status: result.status, headers: result.headers });
    }

    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { ...result.headers, "content-type": "application/json" },
    });
  };
}
