import type { Locale } from "./routing";

export interface ChatWidgetContent {
  openLabel: string;
  closeLabel: string;
  dialogTitle: string;
  dialogSubtitle: string;
  inputLabel: string;
  inputPlaceholder: string;
  sendLabel: string;
  quickQuestionsLabel: string;
  quickQuestions: string[];
  initialMessage: string;
  conversationLogLabel: string;
  typingStatusText: string;
  /** Passed to `Date#toLocaleTimeString` for message timestamps. */
  timeLocale: string;
}

export const chatWidgetContent: Record<Locale, ChatWidgetContent> = {
  es: {
    openLabel: "Abrir chat de asistente virtual",
    closeLabel: "Cerrar chat",
    dialogTitle: "Asistente iJAC",
    dialogSubtitle: "Orientación automática",
    inputLabel: "Escribí tu pregunta",
    inputPlaceholder: "Escribí tu pregunta...",
    sendLabel: "Enviar mensaje",
    quickQuestionsLabel: "Preguntas frecuentes:",
    quickQuestions: [
      "¿Qué servicios ofrecen?",
      "Quiero una cotización",
      "Necesito soporte técnico",
      "¿Cuál es el horario de atención?",
      "¿Cómo los contacto?",
    ],
    initialMessage:
      "¡Hola! Soy el asistente virtual de iJAC IT Solutions. Puedo orientarte sobre nuestros servicios, cotizaciones y soporte. ¿En qué puedo ayudarte?",
    conversationLogLabel: "Conversación",
    typingStatusText: "El asistente está preparando una respuesta",
    timeLocale: "es-AR",
  },
  en: {
    openLabel: "Open virtual assistant chat",
    closeLabel: "Close chat",
    dialogTitle: "iJAC Assistant",
    dialogSubtitle: "Automated guidance",
    inputLabel: "Type your question",
    inputPlaceholder: "Type your question...",
    sendLabel: "Send message",
    quickQuestionsLabel: "Frequently asked questions:",
    quickQuestions: [
      "What services do you offer?",
      "I want a quote",
      "I need technical support",
      "What are your business hours?",
      "How do I contact you?",
    ],
    initialMessage:
      "Hi! I'm iJAC IT Solutions' virtual assistant. I can help you with our services, quotes, and support. How can I help you?",
    conversationLogLabel: "Conversation",
    typingStatusText: "The assistant is preparing a response",
    timeLocale: "en-US",
  },
};
