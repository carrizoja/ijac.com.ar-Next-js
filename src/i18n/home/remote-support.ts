import type { Locale } from "../routing";

interface RemoteSupportContent {
  eyebrow: string;
  heading: string;
  description: string;
  coordination: string;
  cta: string;
  status: string;
  disclaimer?: string;
}

export const remoteSupportContent: Record<Locale, RemoteSupportContent> = {
  es: {
    eyebrow: "Soporte remoto profesional",
    heading: "Asistencia remota con TeamViewer, estés donde estés",
    description: "iJAC utiliza licencias profesionales de TeamViewer para brindar soporte técnico remoto a personas y empresas, sin importar la ciudad o el país.",
    coordination: "Coordinamos cada asistencia por nuestros canales habituales y nos conectamos únicamente cuando lo necesitás.",
    cta: "Consultar soporte remoto",
    status: "Atención coordinada a distancia",
  },
  en: {
    eyebrow: "Professional remote support",
    heading: "Remote assistance with TeamViewer, wherever you are",
    description: "iJAC uses professional TeamViewer licenses to provide remote technical support to individuals and businesses, regardless of city or country.",
    coordination: "We schedule every session through our usual channels and connect only when you need assistance.",
    cta: "Ask remote support",
    status: "Scheduled remote assistance",
    disclaimer: "TeamViewer is a third-party product. iJAC is not affiliated with or endorsed by TeamViewer.",
  },
};
