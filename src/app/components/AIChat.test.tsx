// @vitest-environment jsdom

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AIChat } from "./AIChat";
import type { ChatTelemetryDetail } from "./chat/chatTelemetry";

vi.mock("motion/react", async () => {
  const React = await import("react");
  const createMotionComponent = (tag: string) =>
    React.forwardRef<HTMLElement, Record<string, unknown>>((props, ref) => {
      const domProps = { ...props };

      for (const prop of [
        "animate",
        "exit",
        "initial",
        "transition",
        "whileHover",
        "whileTap",
      ]) {
        delete domProps[prop];
      }

      return React.createElement(tag, { ...domProps, ref });
    });

  return {
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
    motion: {
      button: createMotionComponent("button"),
      div: createMotionComponent("div"),
      section: createMotionComponent("section"),
      svg: createMotionComponent("svg"),
    },
  };
});

let telemetry: ChatTelemetryDetail[];
let telemetryListener: EventListener;

async function advanceResponse() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 550));
  });
}

async function openChat() {
  const user = userEvent.setup();
  const launcher = screen.getByRole("button", {
    name: "Abrir chat de asistente virtual",
  });

  await user.click(launcher);

  return { launcher, user };
}

describe("AIChat", () => {
  beforeEach(() => {
    telemetry = [];
    telemetryListener = (event) => {
      telemetry.push((event as CustomEvent<ChatTelemetryDetail>).detail);
    };
    window.addEventListener("ijac:chatbot", telemetryListener);
  });

  afterEach(() => {
    window.removeEventListener("ijac:chatbot", telemetryListener);
    vi.restoreAllMocks();
  });

  it("opens an accessible dialog, focuses its input, and closes from its named control", async () => {
    render(<AIChat />);

    const { launcher, user } = await openChat();
    const dialog = screen.getByRole("dialog", { name: "Asistente iJAC" });

    expect(launcher).toHaveAccessibleName("Cerrar chat");
    expect(launcher).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("textbox", { name: "Escribí tu pregunta" })).toHaveFocus();

    await user.click(within(dialog).getByRole("button", { name: "Cerrar chat" }));

    expect(screen.queryByRole("dialog", { name: "Asistente iJAC" })).not.toBeInTheDocument();
    expect(launcher).toHaveAccessibleName("Abrir chat de asistente virtual");
    expect(launcher).toHaveAttribute("aria-expanded", "false");
    expect(launcher).toHaveFocus();
  });

  it("closes with Escape and restores focus to the launcher", async () => {
    render(<AIChat />);

    const { launcher, user } = await openChat();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(launcher).toHaveFocus();
  });

  it("focuses the textbox when reopened from the keyboard", async () => {
    render(<AIChat />);

    const { launcher, user } = await openChat();
    await user.keyboard("{Escape}");
    await user.keyboard("{Enter}");

    expect(screen.getByRole("dialog", { name: "Asistente iJAC" })).toHaveAttribute(
      "aria-modal",
      "true",
    );
    expect(screen.getByRole("textbox", { name: "Escribí tu pregunta" })).toHaveFocus();
    expect(launcher).toHaveAccessibleName("Cerrar chat");
  });

  it("wraps forward Tab from the last enabled dialog control", async () => {
    render(<AIChat />);

    const { user } = await openChat();
    const dialog = screen.getByRole("dialog", { name: "Asistente iJAC" });
    const input = within(dialog).getByRole("textbox", { name: "Escribí tu pregunta" });

    expect(within(dialog).getByRole("button", { name: "Enviar mensaje" })).toBeDisabled();
    input.focus();
    await user.tab();

    expect(within(dialog).getByRole("button", { name: "Cerrar chat" })).toHaveFocus();
  });

  it("wraps backward Shift+Tab from the first enabled dialog control", async () => {
    render(<AIChat />);

    const { user } = await openChat();
    const dialog = screen.getByRole("dialog", { name: "Asistente iJAC" });
    const closeButton = within(dialog).getByRole("button", { name: "Cerrar chat" });

    closeButton.focus();
    await user.tab({ shift: true });

    expect(within(dialog).getByRole("textbox", { name: "Escribí tu pregunta" })).toHaveFocus();
  });

  it("recovers focus into the dialog when Tab starts outside it", async () => {
    render(
      <>
        <a href="#background">Background link</a>
        <AIChat />
      </>,
    );

    const { user } = await openChat();
    const dialog = screen.getByRole("dialog", { name: "Asistente iJAC" });
    const backgroundLink = screen.getByRole("link", { name: "Background link" });

    backgroundLink.focus();
    await user.tab();

    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    expect(within(dialog).getByRole("button", { name: "Cerrar chat" })).toHaveFocus();
  });

  it("submits the clicked quick question instead of stale typed input", async () => {
    render(<AIChat />);
    const { user } = await openChat();
    const input = screen.getByRole("textbox", { name: "Escribí tu pregunta" });
    const log = screen.getByRole("log", { name: "Conversación" });

    await user.type(input, "consulta anterior");
    await user.click(screen.getByRole("button", { name: "¿Cuál es el horario de atención?" }));

    expect(log).toHaveTextContent("¿Cuál es el horario de atención?");
    expect(log).not.toHaveTextContent("consulta anterior");
    expect(input).toHaveValue("");

    await advanceResponse();

    expect(log).toHaveTextContent("Nuestro horario de atención es");
  });

  it("locks typing and rejects an overlapping submission", async () => {
    render(<AIChat />);
    const { user } = await openChat();
    const input = screen.getByRole("textbox", { name: "Escribí tu pregunta" });
    const form = input.closest("form");

    expect(form).not.toBeNull();
    await user.type(input, "Necesito soporte");
    await user.click(screen.getByRole("button", { name: "Enviar mensaje" }));
    fireEvent.submit(form!);

    expect(input).toBeDisabled();
    expect(screen.getByRole("button", { name: "Enviar mensaje" })).toBeDisabled();
    expect(screen.getAllByText("Necesito soporte")).toHaveLength(1);

    await advanceResponse();

    expect(input).toBeEnabled();
    expect(screen.getByText("Te ayudo a orientar el caso. ¿Es un problema de PC, equipo Apple, red o sitio web?")).toBeInTheDocument();
  });

  it("cancels pending work on unmount without late telemetry or errors", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { unmount } = render(<AIChat />);
    const { user } = await openChat();

    await user.click(screen.getByRole("button", { name: "¿Cómo los contacto?" }));
    expect(telemetry.map(({ event }) => event)).toEqual(["opened", "submitted"]);

    unmount();
    await advanceResponse();

    expect(telemetry.map(({ event }) => event)).toEqual(["opened", "submitted"]);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("exposes assistant responses in the live log and emits privacy-safe contact telemetry", async () => {
    render(<AIChat />);
    const { user } = await openChat();
    const input = screen.getByRole("textbox", { name: "Escribí tu pregunta" });
    const log = screen.getByRole("log", { name: "Conversación" });
    const privateMessage = "Mi email es persona@example.com, quiero contacto";

    expect(log).toHaveAttribute("aria-live", "polite");
    await user.type(input, privateMessage);
    await user.click(screen.getByRole("button", { name: "Enviar mensaje" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "El asistente está preparando una respuesta",
    );

    await advanceResponse();

    expect(log).toHaveTextContent("Podés escribirnos por WhatsApp");
    expect(telemetry).toEqual([
      { event: "opened" },
      { event: "submitted" },
      { event: "matched", intent: "contact" },
      { event: "contact_handoff", intent: "contact" },
    ]);
    expect(JSON.stringify(telemetry)).not.toContain(privateMessage);
    expect(JSON.stringify(telemetry)).not.toContain("persona@example.com");
  });

  it("emits fallback telemetry for an unsupported question", async () => {
    render(<AIChat />);
    const { user } = await openChat();

    await user.type(
      screen.getByRole("textbox", { name: "Escribí tu pregunta" }),
      "¿Qué framework usan?",
    );
    await user.click(screen.getByRole("button", { name: "Enviar mensaje" }));
    await advanceResponse();

    expect(telemetry.at(-1)).toEqual({ event: "fallback", intent: "fallback" });
    expect(screen.getByRole("log", { name: "Conversación" })).toHaveTextContent(
      "No tengo información aprobada",
    );
  });

  it("advances a quote flow through the UI", async () => {
    render(<AIChat />);
    const { user } = await openChat();

    await user.click(screen.getByRole("button", { name: "Quiero una cotización" }));
    await advanceResponse();
    expect(screen.getByRole("log", { name: "Conversación" })).toHaveTextContent(
      "¿Buscás desarrollo digital, soporte técnico, infraestructura, seguridad u otro servicio?",
    );

    const input = screen.getByRole("textbox", { name: "Escribí tu pregunta" });
    await user.type(input, "Un sitio web");
    await user.click(screen.getByRole("button", { name: "Enviar mensaje" }));
    await advanceResponse();

    expect(screen.getByRole("log", { name: "Conversación" })).toHaveTextContent(
      "¿Tenés una fecha objetivo o alguna prioridad que debamos considerar?",
    );
  });
});
