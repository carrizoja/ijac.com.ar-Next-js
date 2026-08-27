import type { SupportedLanguage } from "@ijac/contracts/chat";
import type { ChatApiClient } from "./chatApi";
import {
  getChatResponse,
  type ChatIntent,
  type ConversationContext,
} from "./chatEngine";

/** Owner-approved handoff copy. These strings are contractual — do not reword. */
export const UNKNOWN_COPY: Record<SupportedLanguage, string> = {
  es: "No encontré información aprobada para responder con seguridad. Escríbenos por WhatsApp.",
  en: "I could not find approved information to answer safely. Contact us on WhatsApp.",
  pt: "Não encontrei informação aprovada para responder com segurança. Fale conosco pelo WhatsApp.",
};

export interface ChatSourceLink {
  id: string;
  title: string;
  url?: string;
}

export type ChatTurnKind = "deterministic" | "grounded" | "unknown";

export interface ChatTurn {
  intent: ChatIntent;
  kind: ChatTurnKind;
  text: string;
  context: ConversationContext;
  contactHandoff: boolean;
  sources: ChatSourceLink[];
}

export interface HybridChatDeps {
  /** null disables AI routing entirely, restoring deterministic-only behavior. */
  client: ChatApiClient | null;
  language: SupportedLanguage;
}

/**
 * Resolves one visitor turn.
 *
 * Precedence, highest first: deterministic match, active conversation flow, disabled flag,
 * then the grounded API. An active quotation or support flow is never handed to the API, and
 * an AI turn never mutates conversation state — the caller's context is returned untouched.
 */
export async function resolveChatTurn(
  input: string,
  context: ConversationContext,
  deps: HybridChatDeps,
  signal?: AbortSignal,
): Promise<ChatTurn> {
  const deterministic = getChatResponse(input, context);

  const asDeterministic = (): ChatTurn => ({
    intent: deterministic.intent,
    kind: "deterministic",
    text: deterministic.text,
    context: deterministic.context,
    contactHandoff: deterministic.contactHandoff,
    sources: [],
  });

  // A real match or a disabled flag resolves without the API.
  if (deterministic.intent !== "fallback") return asDeterministic();

  // Unreachable today: shouldInterruptFlow() returns false for "fallback", so an active
  // context always resolves through continueFlow() and yields a quote/support intent above.
  // Kept deliberately — it pins "an active flow never reaches the provider" to this module
  // rather than to an invariant of chatEngine that a future edit could quietly relax.
  /* c8 ignore next */
  if (context !== null) return asDeterministic();

  if (deps.client === null) return asDeterministic();

  const response = await deps.client.ask(input, deps.language, signal);

  const handoff = (): ChatTurn => ({
    intent: deterministic.intent,
    kind: "unknown",
    text: UNKNOWN_COPY[deps.language],
    context,
    contactHandoff: true,
    sources: [],
  });

  // Only a SUCCESS body may put provider text on screen; any other code hands off.
  if (response.code !== "SUCCESS" || response.supported !== true) return handoff();

  return {
    intent: deterministic.intent,
    kind: "grounded",
    text: response.answer,
    context,
    contactHandoff: false,
    sources: (response.sources ?? []).map((source) => ({
      id: source.id,
      title: source.title,
      ...(source.url ? { url: source.url } : {}),
    })),
  };
}
