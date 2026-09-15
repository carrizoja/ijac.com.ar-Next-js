import { describe, expect, it } from "vitest";
import { chatWidgetContent } from "./chat";

describe("chatWidgetContent (es)", () => {
  it("keeps the original Spanish widget copy byte-identical", () => {
    const copy = chatWidgetContent.es;

    expect(copy.openLabel).toBe("Abrir chat de asistente virtual");
    expect(copy.closeLabel).toBe("Cerrar chat");
    expect(copy.dialogTitle).toBe("Asistente iJAC");
    expect(copy.dialogSubtitle).toBe("Orientación automática");
    expect(copy.inputLabel).toBe("Escribí tu pregunta");
    expect(copy.inputPlaceholder).toBe("Escribí tu pregunta...");
    expect(copy.sendLabel).toBe("Enviar mensaje");
    expect(copy.quickQuestionsLabel).toBe("Preguntas frecuentes:");
    expect(copy.quickQuestions).toEqual([
      "¿Qué servicios ofrecen?",
      "Quiero una cotización",
      "Necesito soporte técnico",
      "¿Cuál es el horario de atención?",
      "¿Cómo los contacto?",
    ]);
    expect(copy.initialMessage).toBe(
      "¡Hola! Soy el asistente virtual de iJAC IT Solutions. Puedo orientarte sobre nuestros servicios, cotizaciones y soporte. ¿En qué puedo ayudarte?",
    );
    expect(copy.conversationLogLabel).toBe("Conversación");
    expect(copy.typingStatusText).toBe("El asistente está preparando una respuesta");
    expect(copy.timeLocale).toBe("es-AR");
  });
});

describe("chatWidgetContent (en)", () => {
  it("provides English copy with no Spanish leakage", () => {
    const copy = chatWidgetContent.en;
    const allText = JSON.stringify(copy);

    expect(allText).not.toMatch(/[áéíóúñ¿]/i);
    expect(copy.quickQuestions).toHaveLength(5);
    expect(copy.timeLocale).toBe("en-US");
  });

  it("keeps the same number of quick questions as Spanish", () => {
    expect(chatWidgetContent.en.quickQuestions).toHaveLength(
      chatWidgetContent.es.quickQuestions.length,
    );
  });
});
