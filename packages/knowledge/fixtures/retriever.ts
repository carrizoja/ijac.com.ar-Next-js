import type { ApprovedKnowledgeEntry } from "../types";

const makeEntry = (
  id: string,
  content: Partial<ApprovedKnowledgeEntry>,
): ApprovedKnowledgeEntry => ({
  id,
  status: "approved",
  owner: "retrieval-test-owner",
  title: { es: "Servicio", en: "Service", pt: "Serviço" },
  claims: ["Approved service claim."],
  aliases: { es: [], en: [], pt: [] },
  tags: ["service"],
  version: 1,
  approvedAt: "2026-01-01T00:00:00.000Z",
  reviewedAt: "2026-01-01T00:00:00.000Z",
  reapprovalDueAt: "2099-01-01T00:00:00.000Z",
  ...content,
});

export const retrieverFixtures = {
  weighted: [
    makeEntry("tag-network", { tags: ["network"] }),
    makeEntry("title-network", { title: { es: "Servicio", en: "Network", pt: "Serviço" } }),
    makeEntry("alias-network", { aliases: { es: [], en: ["network"], pt: [] } }),
    makeEntry("claim-network", { claims: ["Network claim."], tags: ["service"] }),
  ],
  multilingual: [
    makeEntry("managed-it-support", {
      title: { es: "Soporte IT administrado", en: "Managed IT support", pt: "Suporte de TI gerenciado" },
      aliases: { es: ["soporte técnico"], en: ["technical support"], pt: ["suporte técnico"] },
      tags: ["support", "it"],
      claims: ["Managed support for business technology environments."],
    }),
  ],
  topK: [
    makeEntry("support-one", { tags: ["support"] }),
    makeEntry("support-two", { tags: ["support"] }),
    makeEntry("support-three", { tags: ["support"] }),
    makeEntry("support-four", { tags: ["support"] }),
  ],
  ties: [
    makeEntry("older-review", { tags: ["consulting"], version: 1, reviewedAt: "2026-01-01T00:00:00.000Z" }),
    makeEntry("newer-review", { tags: ["consulting"], version: 1, reviewedAt: "2026-02-01T00:00:00.000Z" }),
    makeEntry("version-two", { tags: ["consulting"], version: 2, reviewedAt: "2026-01-01T00:00:00.000Z" }),
  ],
  ambiguous: [
    makeEntry("cloud-private", { tags: ["cloud"], version: 2 }),
    makeEntry("cloud-public", { tags: ["cloud"], version: 1 }),
  ],
} satisfies Record<string, ApprovedKnowledgeEntry[]>;
