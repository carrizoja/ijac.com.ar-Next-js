import { services } from "../../../data/services";
import { business } from "../../../data/business";
import { businessHoursDisplayEn } from "../../../i18n/faq";
import { getServiceCopyForLocale } from "../../../i18n/services/catalog";
import type { Locale } from "../../../i18n/routing";

export type ChatIntent =
  | "apple_support"
  | "networking"
  | "hardware"
  | "cybersecurity"
  | "ux_ui"
  | "web_development"
  | "data_ai"
  | "branding"
  | "quote"
  | "support"
  | "contact"
  | "hours"
  | "location"
  | "services"
  | "greeting"
  | "fallback";

export type ConversationContext =
  | { flow: "quote"; step: "need" | "timing" }
  | { flow: "support"; step: "area" | "issue" }
  | null;

export interface ChatResponse {
  intent: ChatIntent;
  text: string;
  context: ConversationContext;
  contactHandoff: boolean;
}

const serviceBySlug = services.reduce<
  Record<string, (typeof services)[number]>
>((bySlug, service) => {
  bySlug[service.slug] = service;
  return bySlug;
}, {});

/**
 * Per-locale copy and matching phrases for the eight conversational intents
 * (greeting, fallback, quote, support, contact, hours, location, services)
 * and the flow machinery they share. Trigger phrases and response text are
 * kept together per locale so a reviewer can audit one language at a time.
 *
 * The other eight intents (apple_support, networking, hardware,
 * cybersecurity, ux_ui, web_development, data_ai, branding) are deliberately
 * NOT represented here: they match Spanish phrasing only, regardless of
 * locale, so an English question about them falls through to the grounded
 * API — which is exactly what the English knowledge claims cover.
 */
interface LocaleCopy {
  emptyInput: string;
  cancelPhrases: string[];
  cancelResponse: string;
  /** Extra phrases that mark an ambiguous message as a genuine new question, used to decide whether it should interrupt an active flow. */
  interruptPhrases: string[];
  quoteTriggerPhrases: string[];
  quoteNeedPrompt: string;
  quoteTimingPrompt: string;
  quoteCompletion: string;
  supportTriggerPhrases: string[];
  supportIssuePrompt: string;
  supportAreaPrompt: string;
  supportCompletion: string;
  contactTriggerPhrases: string[];
  contactAnswer: string;
  hoursTriggerPhrases: string[];
  hoursAnswer: string;
  locationTriggerPhrases: string[];
  locationAnswer: string;
  servicesTriggerPhrases: string[];
  servicesAnswer: string;
  greetingTriggerPhrases: string[];
  greetingAnswer: string;
  unsupportedInformationText: string;
}

function serviceTitlesForLocale(locale: Locale): string[] {
  if (locale === "es") return services.map((service) => service.title);

  return services
    .map((service) => getServiceCopyForLocale(service.slug, "en")?.title)
    .filter((title): title is string => Boolean(title));
}

function buildLocaleCopy(locale: Locale): LocaleCopy {
  const contactText =
    locale === "es"
      ? `Podés escribirnos por WhatsApp al ${business.phoneDisplay} o por email a ${business.email}.`
      : `You can reach us on WhatsApp at ${business.phoneDisplay} or by email at ${business.email}.`;

  const unsupportedInformationText =
    locale === "es"
      ? `No tengo información aprobada para responder eso con precisión. Puedo ayudarte con servicios, cotizaciones, soporte, horarios o contacto. También podés comunicarte directamente: ${contactText}`
      : `I don't have approved information to answer that accurately. I can help with services, quotes, support, hours, or contact. You can also reach us directly: ${contactText}`;

  if (locale === "en") {
    return {
      emptyInput: "Type a question so I can help you.",
      cancelPhrases: ["cancel", "start over", "never mind", "another question"],
      cancelResponse:
        "Okay. Would you like to ask about services, request a quote, or get support?",
      interruptPhrases: [
        "i want to ask",
        "i want to know",
        "i need information",
        "information about",
        "tell me about",
        "can you tell me about",
      ],
      quoteTriggerPhrases: ["price", "prices", "cost", "how much", "quote", "estimate", "budget"],
      quoteNeedPrompt:
        "To prepare a quote we need to understand the scope. Are you looking for digital development, technical support, infrastructure, security, or another service?",
      quoteTimingPrompt: "Do you have a target date or any priority we should consider?",
      quoteCompletion: `Thanks, with that we can move ahead with the evaluation. ${contactText}`,
      // Deliberately no bare "support": a phrase like "what is managed IT
      // support?" is a service question for the grounded API, not a
      // support request. Only explicit request phrasing matches here.
      supportTriggerPhrases: [
        "technical support",
        "tech support",
        "customer support",
        "support ticket",
        "need support",
        "get support",
        "help me",
        "broken",
        "not working",
        "having trouble",
        "issue with",
        "problem with",
        "maintenance",
        "repair",
      ],
      supportIssuePrompt:
        "I can help triage the case. Is it a PC, an Apple device, a network, or a website issue?",
      supportAreaPrompt:
        "What's happening mainly: it won't turn on, it's running slow, it won't connect, or it's showing an error?",
      supportCompletion: `Thanks. To review the case without risking your data or your equipment, let's schedule the diagnosis with us. ${contactText}`,
      contactTriggerPhrases: [
        "contact",
        "phone",
        "telephone",
        "whatsapp",
        "email",
        "talk to someone",
        "reach you",
      ],
      contactAnswer: `${contactText}\n\nYou can also find us at ${business.location}.`,
      hoursTriggerPhrases: ["hours", "opening hours", "business hours", "when are you open", "what time"],
      hoursAnswer: `Our business hours are ${businessHoursDisplayEn}.`,
      locationTriggerPhrases: [
        "location",
        "address",
        "where are you",
        "where are you located",
        "how to get there",
      ],
      locationAnswer: `We are located at ${business.location}.`,
      servicesTriggerPhrases: ["service", "services", "what do you do", "what do you offer", "solutions"],
      servicesAnswer: `Our services are:\n\n${serviceTitlesForLocale("en")
        .map((title) => `• ${title}`)
        .join("\n")}\n\nTell me which one interests you and I'll share more.`,
      greetingTriggerPhrases: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"],
      greetingAnswer:
        "Hi! I can help you learn about our services, get a quote, or start a support diagnosis.",
      unsupportedInformationText,
    };
  }

  return {
    emptyInput: "Escribí una consulta para que pueda orientarte.",
    cancelPhrases: ["cancelar", "empezar de nuevo", "otra consulta"],
    cancelResponse: "De acuerdo. ¿Querés consultar por servicios, pedir una cotización o solicitar soporte?",
    interruptPhrases: [
      "quiero consultar",
      "quiero saber",
      "necesito informacion",
      "informacion sobre",
      "contame sobre",
      "hablame de",
    ],
    quoteTriggerPhrases: ["precio", "precios", "costo", "cuanto cuesta", "presupuesto", "cotizacion", "cotizar"],
    quoteNeedPrompt:
      "Para preparar una cotización necesitamos entender el alcance. ¿Buscás desarrollo digital, soporte técnico, infraestructura, seguridad u otro servicio?",
    quoteTimingPrompt: "¿Tenés una fecha objetivo o alguna prioridad que debamos considerar?",
    quoteCompletion: `Gracias, con esos datos ya podemos continuar la evaluación. ${contactText}`,
    supportTriggerPhrases: [
      "soporte",
      "servicio tecnico",
      "mantenimiento",
      "reparacion",
      "ayuda tecnica",
      "no funciona",
    ],
    supportIssuePrompt: "Te ayudo a orientar el caso. ¿Es un problema de PC, equipo Apple, red o sitio web?",
    supportAreaPrompt:
      "¿Qué ocurre principalmente: no enciende, funciona lento, no conecta o muestra un error?",
    supportCompletion: `Gracias. Para revisar el caso sin arriesgar tus datos o el equipo, coordiná el diagnóstico con nosotros. ${contactText}`,
    contactTriggerPhrases: [
      "contacto",
      "contactar",
      "telefono",
      "whatsapp",
      "email",
      "correo",
      "hablar con alguien",
    ],
    contactAnswer: `${contactText}\n\nTambién estamos en ${business.location}.`,
    hoursTriggerPhrases: ["horario", "horarios", "hora de atencion", "cuando atienden"],
    hoursAnswer: `Nuestro horario de atención es ${business.hours.display.toLocaleLowerCase("es")}.`,
    locationTriggerPhrases: ["ubicacion", "direccion", "donde estan", "donde se encuentran", "como llegar"],
    locationAnswer: `Estamos en ${business.location}.`,
    servicesTriggerPhrases: ["servicio", "servicios", "que hacen", "que ofrecen", "soluciones"],
    servicesAnswer: `Nuestros servicios son:\n\n${serviceTitlesForLocale("es")
      .map((title) => `• ${title}`)
      .join("\n")}\n\nDecime cuál te interesa y te cuento más.`,
    greetingTriggerPhrases: ["hola", "buen dia", "buenas tardes", "buenas noches"],
    greetingAnswer:
      "¡Hola! Puedo orientarte sobre nuestros servicios, ayudarte a pedir una cotización o iniciar un diagnóstico de soporte.",
    unsupportedInformationText,
  };
}

const copyByLocale: Record<Locale, LocaleCopy> = {
  es: buildLocaleCopy("es"),
  en: buildLocaleCopy("en"),
};

export function normalizeChatInput(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLocaleLowerCase("es")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function includesAny(message: string, phrases: string[]): boolean {
  const paddedMessage = ` ${message} `;
  return phrases.some((phrase) =>
    paddedMessage.includes(` ${normalizeChatInput(phrase)} `),
  );
}

function serviceResponse(slug: string, intro: string): string {
  const service = serviceBySlug[slug];

  if (!service) {
    return copyByLocale.es.unsupportedInformationText;
  }

  return `${intro}\n\n${service.highlights.map((item) => `• ${item}`).join("\n")}\n\n¿Querés contarnos qué necesitás?`;
}

function continueFlow(
  context: Exclude<ConversationContext, null>,
  copy: LocaleCopy,
): ChatResponse {
  if (context.flow === "quote" && context.step === "need") {
    return {
      intent: "quote",
      text: copy.quoteTimingPrompt,
      context: { flow: "quote", step: "timing" },
      contactHandoff: false,
    };
  }

  if (context.flow === "quote") {
    return {
      intent: "quote",
      text: copy.quoteCompletion,
      context: null,
      contactHandoff: true,
    };
  }

  if (context.step === "area") {
    return {
      intent: "support",
      text: copy.supportAreaPrompt,
      context: { flow: "support", step: "issue" },
      contactHandoff: false,
    };
  }

  return {
    intent: "support",
    text: copy.supportCompletion,
    context: null,
    contactHandoff: true,
  };
}

function shouldInterruptFlow(
  input: string,
  message: string,
  intent: ChatIntent,
  context: Exclude<ConversationContext, null>,
  copy: LocaleCopy,
): boolean {
  if (["contact", "hours", "location"].includes(intent)) {
    return true;
  }

  if (
    (intent === "quote" || intent === "support") &&
    intent !== context.flow
  ) {
    return true;
  }

  if (intent === "fallback" || intent === "greeting" || intent === context.flow) {
    return false;
  }

  return /[?¿]/.test(input) || includesAny(message, copy.interruptPhrases);
}

export function getChatResponse(
  input: string,
  context: ConversationContext = null,
  locale: Locale = "es",
): ChatResponse {
  const copy = copyByLocale[locale];
  const message = normalizeChatInput(input);

  if (!message) {
    return {
      intent: "fallback",
      text: copy.emptyInput,
      context,
      contactHandoff: false,
    };
  }

  if (includesAny(message, copy.cancelPhrases)) {
    return {
      intent: "greeting",
      text: copy.cancelResponse,
      context: null,
      contactHandoff: false,
    };
  }

  if (context) {
    const reclassifiedResponse = getChatResponse(input, null, locale);

    if (
      shouldInterruptFlow(
        input,
        message,
        reclassifiedResponse.intent,
        context,
        copy,
      )
    ) {
      return reclassifiedResponse;
    }

    return continueFlow(context, copy);
  }

  if (includesAny(message, copy.quoteTriggerPhrases)) {
    return {
      intent: "quote",
      text: copy.quoteNeedPrompt,
      context: { flow: "quote", step: "need" },
      contactHandoff: false,
    };
  }

  if (
    includesAny(message, [
      "apple",
      "mac",
      "macbook",
      "imac",
      "iphone",
      "ipad",
      "servicio tecnico apple",
    ])
  ) {
    return {
      intent: "apple_support",
      text: serviceResponse(
        "soporte-tecnico-pc-mac-apple",
        "Brindamos diagnóstico y soporte para PC, Mac y dispositivos Apple.",
      ),
      context: null,
      contactHandoff: false,
    };
  }

  if (
    includesAny(message, [
      "wifi",
      "wi fi",
      "lan",
      "red",
      "redes",
      "router",
      "cableado",
      "conectividad",
    ])
  ) {
    return {
      intent: "networking",
      text: serviceResponse(
        "redes-wifi-cableado",
        "Diseñamos e instalamos redes WiFi y cableadas.",
      ),
      context: null,
      contactHandoff: false,
    };
  }

  if (
    includesAny(message, [
      "armado de pc",
      "pc gamer",
      "computadora a medida",
      "hardware",
      "componentes",
    ])
  ) {
    return {
      intent: "hardware",
      text: serviceResponse(
        "armado-pcs-hardware",
        "Armamos y optimizamos equipos según el uso y el presupuesto disponible.",
      ),
      context: null,
      contactHandoff: false,
    };
  }

  if (
    includesAny(message, [
      "ciberseguridad",
      "seguridad informatica",
      "proteccion de datos",
      "antivirus",
      "firewall",
      "malware",
    ])
  ) {
    return {
      intent: "cybersecurity",
      text: serviceResponse(
        "ciberseguridad-proteccion-datos",
        "Implementamos medidas de ciberseguridad para equipos, redes y datos.",
      ),
      context: null,
      contactHandoff: false,
    };
  }

  if (includesAny(message, ["ux", "ui", "ux ui", "experiencia de usuario", "prototipo"])) {
    return {
      intent: "ux_ui",
      text: serviceResponse(
        "diseno-ux-ui",
        "Diseñamos experiencias e interfaces digitales claras y funcionales.",
      ),
      context: null,
      contactHandoff: false,
    };
  }

  if (
    includesAny(message, [
      "sitio web",
      "pagina web",
      "desarrollo web",
      "web app",
      "aplicacion movil",
      "app movil",
      "landing",
      "ecommerce",
      "e commerce",
      "tienda online",
    ])
  ) {
    return {
      intent: "web_development",
      text: serviceResponse(
        "desarrollo-web-apps",
        "Desarrollamos sitios web, web apps y productos móviles.",
      ),
      context: null,
      contactHandoff: false,
    };
  }

  if (
    includesAny(message, [
      "data science",
      "inteligencia artificial",
      "analisis de datos",
      "modelo predictivo",
      "automatizacion",
    ])
  ) {
    return {
      intent: "data_ai",
      text: serviceResponse(
        "data-science-inteligencia-artificial",
        "Aplicamos datos e inteligencia artificial a problemas concretos del negocio.",
      ),
      context: null,
      contactHandoff: false,
    };
  }

  if (
    includesAny(message, [
      "branding",
      "marca",
      "identidad visual",
      "logo",
      "marketing digital",
    ])
  ) {
    return {
      intent: "branding",
      text: serviceResponse(
        "branding-marketing-digital",
        "Trabajamos identidad de marca y estrategia de marketing digital.",
      ),
      context: null,
      contactHandoff: false,
    };
  }

  if (includesAny(message, copy.supportTriggerPhrases)) {
    return {
      intent: "support",
      text: copy.supportIssuePrompt,
      context: { flow: "support", step: "area" },
      contactHandoff: false,
    };
  }

  if (includesAny(message, copy.contactTriggerPhrases)) {
    return {
      intent: "contact",
      text: copy.contactAnswer,
      context: null,
      contactHandoff: true,
    };
  }

  if (includesAny(message, copy.hoursTriggerPhrases)) {
    return {
      intent: "hours",
      text: copy.hoursAnswer,
      context: null,
      contactHandoff: false,
    };
  }

  if (includesAny(message, copy.locationTriggerPhrases)) {
    return {
      intent: "location",
      text: copy.locationAnswer,
      context: null,
      contactHandoff: false,
    };
  }

  if (includesAny(message, copy.servicesTriggerPhrases)) {
    return {
      intent: "services",
      text: copy.servicesAnswer,
      context: null,
      contactHandoff: false,
    };
  }

  if (includesAny(message, copy.greetingTriggerPhrases)) {
    return {
      intent: "greeting",
      text: copy.greetingAnswer,
      context: null,
      contactHandoff: false,
    };
  }

  return {
    intent: "fallback",
    text: copy.unsupportedInformationText,
    context: null,
    contactHandoff: false,
  };
}
