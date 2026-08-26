import type { KnowledgeEntry } from "../types";

export const approvedKnowledgeEntriesV1 = [
  {
    id: "managed-it-support",
    status: "approved",
    owner: "content-owner",
    title: {
      es: "Soporte IT administrado",
      en: "Managed IT support",
      pt: "Suporte de TI gerenciado",
    },
    claims: [
      "iJAC provides managed IT support for business technology environments.",
    ],
    aliases: {
      es: ["soporte informático", "soporte técnico"],
      en: ["IT support", "technical support"],
      pt: ["suporte de TI", "suporte técnico"],
    },
    tags: ["support", "it", "business"],
    url: "https://ijac.com.ar/services",
    version: 1,
    approvedAt: "2026-01-01T00:00:00.000Z",
    reviewedAt: "2026-01-01T00:00:00.000Z",
    reapprovalDueAt: "2099-01-01T00:00:00.000Z",
    validationRules: ["Do not infer pricing, availability, or response times."],
  },
] satisfies KnowledgeEntry[];
