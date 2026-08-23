import { services } from "../../../data/services";
import { business } from "../../../data/business";

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

const serviceBySlug = Object.fromEntries(
  services.map((service) => [service.slug, service]),
);

const contactText = `Podés escribirnos por WhatsApp al ${business.phoneDisplay} o por email a ${business.email}.`;

export function normalizeChatInput(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
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
  return `${intro}\n\n${service.highlights.map((item) => `• ${item}`).join("\n")}\n\n¿Querés contarnos qué necesitás?`;
}

function continueFlow(
  context: Exclude<ConversationContext, null>,
): ChatResponse {
  if (context.flow === "quote" && context.step === "need") {
    return {
      intent: "quote",
      text: "¿Tenés una fecha objetivo o alguna prioridad que debamos considerar?",
      context: { flow: "quote", step: "timing" },
      contactHandoff: false,
    };
  }

  if (context.flow === "quote") {
    return {
      intent: "quote",
      text: `Gracias, con esos datos ya podemos continuar la evaluación. ${contactText}`,
      context: null,
      contactHandoff: true,
    };
  }

  if (context.step === "area") {
    return {
      intent: "support",
      text: "¿Qué ocurre principalmente: no enciende, funciona lento, no conecta o muestra un error?",
      context: { flow: "support", step: "issue" },
      contactHandoff: false,
    };
  }

  return {
    intent: "support",
    text: `Gracias. Para revisar el caso sin arriesgar tus datos o el equipo, coordiná el diagnóstico con nosotros. ${contactText}`,
    context: null,
    contactHandoff: true,
  };
}

export function getChatResponse(
  input: string,
  context: ConversationContext = null,
): ChatResponse {
  const message = normalizeChatInput(input);

  if (!message) {
    return {
      intent: "fallback",
      text: "Escribí una consulta para que pueda orientarte.",
      context,
      contactHandoff: false,
    };
  }

  if (includesAny(message, ["cancelar", "empezar de nuevo", "otra consulta"])) {
    return {
      intent: "greeting",
      text: "De acuerdo. ¿Querés consultar por servicios, pedir una cotización o solicitar soporte?",
      context: null,
      contactHandoff: false,
    };
  }

  if (context) {
    return continueFlow(context);
  }

  if (
    includesAny(message, [
      "precio",
      "precios",
      "costo",
      "cuanto cuesta",
      "presupuesto",
      "cotizacion",
      "cotizar",
    ])
  ) {
    return {
      intent: "quote",
      text: "Para preparar una cotización necesitamos entender el alcance. ¿Buscás desarrollo digital, soporte técnico, infraestructura, seguridad u otro servicio?",
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

  if (
    includesAny(message, [
      "soporte",
      "servicio tecnico",
      "mantenimiento",
      "reparacion",
      "ayuda tecnica",
      "no funciona",
    ])
  ) {
    return {
      intent: "support",
      text: "Te ayudo a orientar el caso. ¿Es un problema de PC, equipo Apple, red o sitio web?",
      context: { flow: "support", step: "area" },
      contactHandoff: false,
    };
  }

  if (
    includesAny(message, [
      "contacto",
      "contactar",
      "telefono",
      "whatsapp",
      "email",
      "correo",
      "hablar con alguien",
    ])
  ) {
    return {
      intent: "contact",
      text: `${contactText}\n\nTambién estamos en ${business.location}.`,
      context: null,
      contactHandoff: true,
    };
  }

  if (includesAny(message, ["horario", "horarios", "hora de atencion", "cuando atienden"])) {
    return {
      intent: "hours",
      text: `Nuestro horario de atención es ${business.hours.display.toLocaleLowerCase("es")}.`,
      context: null,
      contactHandoff: false,
    };
  }

  if (
    includesAny(message, [
      "ubicacion",
      "direccion",
      "donde estan",
      "donde se encuentran",
      "como llegar",
    ])
  ) {
    return {
      intent: "location",
      text: `Estamos en ${business.location}.`,
      context: null,
      contactHandoff: false,
    };
  }

  if (
    includesAny(message, [
      "servicio",
      "servicios",
      "que hacen",
      "que ofrecen",
      "soluciones",
    ])
  ) {
    return {
      intent: "services",
      text: `Nuestros servicios son:\n\n${services.map((service) => `• ${service.title}`).join("\n")}\n\nDecime cuál te interesa y te cuento más.`,
      context: null,
      contactHandoff: false,
    };
  }

  if (includesAny(message, ["hola", "buen dia", "buenas tardes", "buenas noches"])) {
    return {
      intent: "greeting",
      text: "¡Hola! Puedo orientarte sobre nuestros servicios, ayudarte a pedir una cotización o iniciar un diagnóstico de soporte.",
      context: null,
      contactHandoff: false,
    };
  }

  return {
    intent: "fallback",
    text: `No tengo información aprobada para responder eso con precisión. Puedo ayudarte con servicios, cotizaciones, soporte, horarios o contacto. También podés comunicarte directamente: ${contactText}`,
    context: null,
    contactHandoff: false,
  };
}
