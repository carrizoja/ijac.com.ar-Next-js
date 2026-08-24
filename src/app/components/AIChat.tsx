"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  getChatResponse,
  type ConversationContext,
} from "./chat/chatEngine";
import { emitChatTelemetry } from "./chat/chatTelemetry";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const quickQuestions = [
  "¿Qué servicios ofrecen?",
  "Quiero una cotización",
  "Necesito soporte técnico",
  "¿Cuál es el horario de atención?",
  "¿Cómo los contacto?",
];

const initialMessage: Message = {
  id: "message-1",
  text: "¡Hola! Soy el asistente virtual de iJAC IT Solutions. Puedo orientarte sobre nuestros servicios, cotizaciones y soporte. ¿En qué puedo ayudarte?",
  isUser: false,
  timestamp: new Date(),
};

const focusableSelector = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const contextRef = useRef<ConversationContext>(null);
  const isProcessingRef = useRef(false);
  const messageIdRef = useRef(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const restoreFocusFrameRef = useRef<number | null>(null);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const nextMessageId = () => {
    messageIdRef.current += 1;
    return `message-${messageIdRef.current}`;
  };

  const closeChat = () => {
    setIsOpen(false);
    if (restoreFocusFrameRef.current !== null) {
      window.cancelAnimationFrame(restoreFocusFrameRef.current);
    }
    restoreFocusFrameRef.current = window.requestAnimationFrame(() => {
      triggerRef.current?.focus();
      restoreFocusFrameRef.current = null;
    });
  };

  const openChat = () => {
    if (restoreFocusFrameRef.current !== null) {
      window.cancelAnimationFrame(restoreFocusFrameRef.current);
      restoreFocusFrameRef.current = null;
    }
    setIsOpen(true);
    emitChatTelemetry({ event: "opened" });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) return;

    inputRef.current?.focus();
    let focusFrame: number | null = null;
    let delayedFocusFrame: number | null = null;
    focusFrame = window.requestAnimationFrame(() => {
      delayedFocusFrame = window.requestAnimationFrame(() => inputRef.current?.focus());
    });
    const handleDialogKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeChat();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);
      const activeElement = document.activeElement;
      const activeElementIsFocusable = focusableElements.includes(
        activeElement as HTMLElement,
      );

      if (!firstElement || !lastElement) {
        event.preventDefault();
        return;
      }

      if (!dialog.contains(activeElement) || !activeElementIsFocusable) {
        event.preventDefault();
        (event.shiftKey ? lastElement : firstElement).focus();
      } else if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };
    document.addEventListener("keydown", handleDialogKeyDown);

    return () => {
      if (focusFrame !== null) window.cancelAnimationFrame(focusFrame);
      if (delayedFocusFrame !== null) window.cancelAnimationFrame(delayedFocusFrame);
      document.removeEventListener("keydown", handleDialogKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      if (restoreFocusFrameRef.current !== null) {
        window.cancelAnimationFrame(restoreFocusFrameRef.current);
      }
    };
  }, []);

  const submitMessage = (rawInput: string) => {
    const text = rawInput.trim();
    if (!text || isProcessingRef.current) return;

    isProcessingRef.current = true;
    inputRef.current?.focus();
    setMessages((current) => [
      ...current,
      {
        id: nextMessageId(),
        text,
        isUser: true,
        timestamp: new Date(),
      },
    ]);
    setInputText("");
    setIsTyping(true);
    emitChatTelemetry({ event: "submitted" });

    const timer = setTimeout(() => {
      const response = getChatResponse(text, contextRef.current);
      contextRef.current = response.context;
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId(),
          text: response.text,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
      emitChatTelemetry({
        event: response.intent === "fallback" ? "fallback" : "matched",
        intent: response.intent,
      });
      if (response.contactHandoff) {
        emitChatTelemetry({ event: "contact_handoff", intent: response.intent });
      }
      setIsTyping(false);
      isProcessingRef.current = false;
      timersRef.current.delete(timer);
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }, 500);

    timersRef.current.add(timer);
  };

  return (
    <>
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={isOpen ? closeChat : openChat}
        className="fixed bottom-4 right-4 z-[1000] flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:ring-offset-2 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Cerrar chat" : "Abrir chat de asistente virtual"}
        aria-expanded={isOpen}
        aria-controls="ijac-chat-dialog"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              aria-hidden="true"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              className="h-6 w-6 text-white sm:h-7 sm:w-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chatbot"
              aria-hidden="true"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              className="h-10 w-10 text-white sm:h-11 sm:w-11"
              viewBox="-1.6 -1.6 19.2 19.2"
              fill="currentColor"
            >
              <path fillRule="evenodd" clipRule="evenodd" d="M8.48 4h4l.5.5v2.03h.52l.5.5V8l-.5.5h-.52v3l-.5.5H9.36l-2.5 2.76L6 14.4V12H3.5l-.5-.64V8.5h-.5L2 8v-.97l.5-.5H3V4.36L3.53 4h4V2.86A1 1 0 0 1 7 2a1 1 0 0 1 2 0 1 1 0 0 1-.52.83V4zM12 8V5H4v5.86l2.5.14H7v2.19l1.8-2.04.35-.15H12V8zm-2.12.51a2.71 2.71 0 0 1-1.37.74v-.01a2.71 2.71 0 0 1-2.42-.74l-.7.71c.34.34.745.608 1.19.79.45.188.932.286 1.42.29a3.7 3.7 0 0 0 2.58-1.07l-.7-.71zM6.49 6.5h-1v1h1v-1zm3 0h1v1h-1v-1z" />
            </motion.svg>
          )}
        </AnimatePresence>
        {!isOpen && (
          <span aria-hidden="true" className="absolute right-0 top-0 h-3 w-3 rounded-full bg-red-500">
            <span className="block h-full w-full animate-ping rounded-full bg-red-400" />
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.section
            ref={dialogRef}
            id="ijac-chat-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ijac-chat-title"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-20 right-4 z-[999] flex h-[30rem] max-h-[calc(100svh-6rem)] w-[calc(100vw-2rem)] max-w-96 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-neutral-900 sm:bottom-24 sm:right-6"
          >
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
              <div aria-hidden="true" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z" />
                </svg>
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="ijac-chat-title" className="font-semibold">Asistente iJAC</h2>
                <p className="text-sm opacity-90">Orientación automática</p>
              </div>
              <button
                type="button"
                onClick={closeChat}
                aria-label="Cerrar chat"
                className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversación" tabIndex={0} className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-lg p-3 ${message.isUser ? "rounded-br-none bg-blue-500 text-white" : "rounded-bl-none bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-white"}`}>
                    <p className="whitespace-pre-line text-sm">{message.text}</p>
                    <p className="mt-1 text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div role="status" className="flex justify-start">
                  <span className="sr-only">El asistente está preparando una respuesta</span>
                  <div aria-hidden="true" className="flex space-x-1 rounded-lg rounded-bl-none bg-gray-100 p-3 dark:bg-neutral-800">
                    {[0, 1, 2].map((dot) => (
                      <span key={dot} className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: `${dot * 0.1}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
              <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Preguntas frecuentes:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => submitMessage(question)}
                      disabled={isTyping}
                      className="min-h-7 rounded-full bg-gray-100 px-2 py-1 text-xs transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form
              className="border-t border-gray-200 p-4 dark:border-gray-700"
              onSubmit={(event) => {
                event.preventDefault();
                submitMessage(inputText);
              }}
            >
              <label htmlFor="ijac-chat-input" className="sr-only">Escribí tu pregunta</label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  id="ijac-chat-input"
                  type="text"
                  value={inputText}
                  onChange={(event) => setInputText(event.target.value)}
                  readOnly={isTyping}
                  placeholder="Escribí tu pregunta..."
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:border-gray-600 dark:bg-neutral-800 dark:text-white"
                />
                <button
                  type="submit"
                  aria-label="Enviar mensaje"
                  disabled={!inputText.trim() || isTyping}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-gray-300"
                >
                  <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m12 19 9 2-9-18-9 18 9-2Zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
