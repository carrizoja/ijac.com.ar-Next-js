import type { ChatIntent } from "./chatEngine";

export type ChatTelemetryDetail =
  | { event: "opened" | "submitted" }
  | { event: "matched" | "fallback"; intent: ChatIntent }
  // Grounded answers and safe handoffs stay distinguishable from deterministic outcomes.
  | { event: "ai_answer" | "ai_unknown"; intent: ChatIntent }
  | { event: "contact_handoff"; intent: ChatIntent };

export function emitChatTelemetry(detail: ChatTelemetryDetail): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<ChatTelemetryDetail>("ijac:chatbot", { detail }),
  );
}
