// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AIChat } from "./AIChat";
import type { ChatTelemetryDetail } from "./chat/chatTelemetry";

vi.mock("motion/react", async () => {
  const React = await import("react");
  const createMotionComponent = (tag: string) => {
    const MotionComponent = React.forwardRef<HTMLElement, Record<string, unknown>>((props, ref) => {
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

    MotionComponent.displayName = `motion.${tag}`;
    return MotionComponent;
  };

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

  it("advances forward Tab from the conversation log to the next control", async () => {
    render(<AIChat />);

    const { user } = await openChat();
    const dialog = screen.getByRole("dialog", { name: "Asistente iJAC" });
    const log = within(dialog).getByRole("log", { name: "Conversación" });

    expect(log).toHaveAttribute("tabindex", "0");
    log.focus();
    await user.tab();

    expect(
      within(dialog).getByRole("button", { name: "¿Qué servicios ofrecen?" }),
    ).toHaveFocus();
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

  it("keeps the textbox focused and read-only while rejecting overlapping input", async () => {
    render(<AIChat />);
    const { user } = await openChat();
    const input = screen.getByRole("textbox", { name: "Escribí tu pregunta" });
    const form = input.closest("form");

    expect(form).not.toBeNull();
    await user.type(input, "Necesito soporte");
    await user.click(screen.getByRole("button", { name: "Enviar mensaje" }));
    await user.type(input, "Envío duplicado");
    fireEvent.submit(form!);

    expect(input).toHaveFocus();
    expect(input).toHaveAttribute("readonly");
    expect(input).not.toBeDisabled();
    expect(input).toHaveValue("");
    expect(screen.getByRole("button", { name: "Enviar mensaje" })).toBeDisabled();
    expect(screen.getAllByText("Necesito soporte")).toHaveLength(1);

    await advanceResponse();

    expect(input).not.toHaveAttribute("readonly");
    expect(input).toBeEnabled();
    expect(input).toHaveFocus();
    expect(screen.getByText("Te ayudo a orientar el caso. ¿Es un problema de PC, equipo Apple, red o sitio web?")).toBeInTheDocument();
  });

  it("hands quick-question focus to the stable textbox while responding", async () => {
    render(<AIChat />);
    const { user } = await openChat();
    const input = screen.getByRole("textbox", { name: "Escribí tu pregunta" });

    await user.click(screen.getByRole("button", { name: "¿Cómo los contacto?" }));

    expect(input).toHaveFocus();
    expect(input).toHaveAttribute("readonly");
    expect(input).not.toBeDisabled();

    await advanceResponse();

    expect(input).not.toHaveAttribute("readonly");
    expect(input).toHaveFocus();
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

describe("AIChat hybrid API routing", () => {
  let telemetry: ChatTelemetryDetail[];
  let listener: EventListener;

  beforeEach(() => {
    telemetry = [];
    listener = (event) => telemetry.push((event as CustomEvent<ChatTelemetryDetail>).detail);
    window.addEventListener("ijac:chatbot", listener);
  });

  afterEach(() => {
    window.removeEventListener("ijac:chatbot", listener);
    vi.restoreAllMocks();
  });

  const groundedBody = {
    apiVersion: "v1" as const,
    code: "SUCCESS" as const,
    supported: true as const,
    answer: "Ofrecemos soporte IT administrado para empresas.",
    language: "es" as const,
    sources: [{ id: "managed-it-support", title: "Soporte IT administrado", url: "https://ijac.com.ar/services" }],
  };

  function stubClient(response: unknown = groundedBody) {
    return { ask: vi.fn(async () => response) };
  }

  async function ask(question: string, client: { ask: ReturnType<typeof vi.fn> } | null) {
    render(<AIChat chatClient={client as never} />);
    const { user } = await openChat();
    const dialog = screen.getByRole("dialog", { name: "Asistente iJAC" });

    await user.type(within(dialog).getByRole("textbox", { name: "Escribí tu pregunta" }), question);
    await user.click(within(dialog).getByRole("button", { name: "Enviar mensaje" }));
    await advanceResponse();

    return { dialog, user };
  }

  it("answers deterministically and never calls the API for a matched question", async () => {
    const client = stubClient();
    await ask("¿Qué servicios ofrecen?", client);

    expect(client.ask).not.toHaveBeenCalled();
  });

  it("keeps deterministic-only behaviour when no client is configured", async () => {
    const { dialog } = await ask("¿Cuál es su garantía de disponibilidad?", null);

    expect(within(dialog).getByText(/No tengo información aprobada/)).toBeInTheDocument();
  });

  it("renders a grounded answer for an unmatched question", async () => {
    const client = stubClient();
    const { dialog } = await ask("¿Cuál es su garantía de disponibilidad?", client);

    expect(client.ask).toHaveBeenCalledOnce();
    expect(
      within(dialog).getByText("Ofrecemos soporte IT administrado para empresas."),
    ).toBeInTheDocument();
  });

  it("renders the approved source link beside a grounded answer", async () => {
    const { dialog } = await ask("¿Cuál es su garantía de disponibilidad?", stubClient());
    const link = within(dialog).getByRole("link", { name: /Soporte IT administrado/ });

    expect(link).toHaveAttribute("href", "https://ijac.com.ar/services");
  });

  it("shows the localized handoff card when the API cannot answer", async () => {
    const client = stubClient({
      apiVersion: "v1",
      code: "PROVIDER_UNAVAILABLE",
      supported: false,
      language: "es",
    });
    const { dialog } = await ask("¿Cuál es su garantía de disponibilidad?", client);

    expect(
      within(dialog).getByText(
        "No encontré información aprobada para responder con seguridad. Escríbenos por WhatsApp.",
      ),
    ).toBeInTheDocument();
  });

  it("reports grounded and unknown outcomes as distinct telemetry events", async () => {
    await ask("¿Cuál es su garantía de disponibilidad?", stubClient());
    expect(telemetry.map((entry) => entry.event)).toContain("ai_answer");

    cleanup();
    telemetry.length = 0;
    const failing = stubClient({ apiVersion: "v1", code: "UNKNOWN", supported: false, language: "es" });
    await ask("¿Cuál es su garantía de disponibilidad?", failing);

    const events = telemetry.map((entry) => entry.event);
    expect(events).toContain("ai_unknown");
    expect(events).not.toContain("ai_answer");
  });

  it("aborts an in-flight turn when the visitor closes the chat", async () => {
    let release: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    const client = {
      ask: vi.fn(async (_question: string, _language: string, signal?: AbortSignal) => {
        await pending;
        if (signal?.aborted) throw Object.assign(new Error("aborted"), { name: "AbortError" });
        return groundedBody;
      }),
    };

    render(<AIChat chatClient={client as never} />);
    const { user } = await openChat();
    const dialog = screen.getByRole("dialog", { name: "Asistente iJAC" });
    await user.type(
      within(dialog).getByRole("textbox", { name: "Escribí tu pregunta" }),
      "¿Cuál es su garantía de disponibilidad?",
    );
    await user.click(within(dialog).getByRole("button", { name: "Enviar mensaje" }));
    await advanceResponse();

    await user.keyboard("{Escape}");
    expect(client.ask.mock.calls[0][2]?.aborted).toBe(true);

    await act(async () => {
      release();
      await Promise.resolve();
    });

    // Reopening proves the late answer was dropped rather than merely hidden.
    await user.click(screen.getByRole("button", { name: "Abrir chat de asistente virtual" }));
    expect(screen.queryByText("Ofrecemos soporte IT administrado para empresas.")).toBeNull();
  });

  it("never renders an answer carried on a failure response", async () => {
    const client = stubClient({
      apiVersion: "v1",
      code: "UNKNOWN",
      supported: false,
      language: "es",
      answer: "Respuesta inyectada",
    });
    const { dialog } = await ask("¿Cuál es su garantía de disponibilidad?", client);

    expect(within(dialog).queryByText("Respuesta inyectada")).toBeNull();
  });
});

describe("AIChat asynchronous accessibility", () => {
  const groundedBody = {
    apiVersion: "v1" as const,
    code: "SUCCESS" as const,
    supported: true as const,
    answer: "Ofrecemos soporte IT administrado para empresas.",
    language: "es" as const,
    sources: [{ id: "managed-it-support", title: "Soporte IT administrado", url: "https://ijac.com.ar/services" }],
  };

  /** A client whose answer lands only when the test releases it. */
  function deferredClient(response: unknown = groundedBody) {
    let release: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    const client = {
      ask: vi.fn(async () => {
        await pending;
        return response;
      }),
    };
    return { client, release: () => release() };
  }

  async function submit(client: unknown, question = "¿Cuál es su garantía de disponibilidad?") {
    render(<AIChat chatClient={client as never} />);
    const { user, launcher } = await openChat();
    const dialog = screen.getByRole("dialog", { name: "Asistente iJAC" });

    await user.type(within(dialog).getByRole("textbox", { name: "Escribí tu pregunta" }), question);
    await user.click(within(dialog).getByRole("button", { name: "Enviar mensaje" }));
    await advanceResponse();

    return { dialog, user, launcher };
  }

  async function settle(release: () => void) {
    await act(async () => {
      release();
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
  }

  it("marks the conversation log busy while an answer is pending", async () => {
    const { client, release } = deferredClient();
    const { dialog } = await submit(client);

    expect(within(dialog).getByRole("log", { name: "Conversación" })).toHaveAttribute(
      "aria-busy",
      "true",
    );

    await settle(release);
    expect(within(dialog).getByRole("log", { name: "Conversación" })).toHaveAttribute(
      "aria-busy",
      "false",
    );
  });

  it("does not steal focus back when the visitor moved it while waiting", async () => {
    const { client, release } = deferredClient();
    const { dialog } = await submit(client);

    const closeButton = within(dialog).getByRole("button", { name: "Cerrar chat" });
    closeButton.focus();
    expect(closeButton).toHaveFocus();

    await settle(release);

    expect(closeButton).toHaveFocus();
  });

  it("returns focus to the textbox when the visitor left it untouched", async () => {
    const { client, release } = deferredClient();
    const { dialog } = await submit(client);

    await settle(release);

    expect(within(dialog).getByRole("textbox", { name: "Escribí tu pregunta" })).toHaveFocus();
  });

  it("recovers focus to the textbox when it was lost to the document while waiting", async () => {
    const { client, release } = deferredClient();
    const { dialog } = await submit(client);

    // Focus dropped to the document body is genuinely lost, not deliberately moved.
    (document.activeElement as HTMLElement | null)?.blur();
    expect(document.body).toHaveFocus();

    await settle(release);

    expect(within(dialog).getByRole("textbox", { name: "Escribí tu pregunta" })).toHaveFocus();
  });

  it("announces the answer in the live log without moving focus into it", async () => {
    const { client, release } = deferredClient();
    const { dialog } = await submit(client);
    await settle(release);

    const log = within(dialog).getByRole("log", { name: "Conversación" });
    expect(log).toHaveTextContent("Ofrecemos soporte IT administrado para empresas.");
    expect(log).not.toHaveFocus();
  });

  it("exposes the approved source link to the keyboard with an accessible name", async () => {
    const { client, release } = deferredClient();
    const { dialog } = await submit(client);
    await settle(release);

    const link = within(dialog).getByRole("link", { name: "Soporte IT administrado" });
    link.focus();

    expect(link).toHaveFocus();
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("still wraps forward Tab once a source link is present, so focus is never trapped", async () => {
    const { client, release } = deferredClient();
    const { dialog, user } = await submit(client);
    await settle(release);

    within(dialog).getByRole("textbox", { name: "Escribí tu pregunta" }).focus();
    await user.tab();

    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it("closes with Escape while an answer is still pending and restores launcher focus", async () => {
    const { client, release } = deferredClient();
    const { user, launcher } = await submit(client);

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(launcher).toHaveFocus();

    await settle(release);
    expect(launcher).toHaveFocus();
  });

  it("retains predictable conversation context across an AI turn", async () => {
    const { client, release } = deferredClient();
    const { dialog, user } = await submit(client);
    await settle(release);

    const input = within(dialog).getByRole("textbox", { name: "Escribí tu pregunta" });
    await user.type(input, "precio");
    await user.click(within(dialog).getByRole("button", { name: "Enviar mensaje" }));
    await advanceResponse();

    // The AI turn left context null, so the deterministic quote flow still starts cleanly.
    expect(within(dialog).getByRole("log", { name: "Conversación" })).toHaveTextContent(
      /Para preparar una cotización/,
    );
  });
});
