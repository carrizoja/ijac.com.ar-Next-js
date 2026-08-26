import { z } from "zod";

export const knowledgeStatuses = ["approved", "draft"] as const;
export const knowledgeLanguages = ["es", "en", "pt"] as const;

const canonicalIJacUrl = z.url().refine((value) => {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "ijac.com.ar" &&
      url.port === "" &&
      url.username === "" &&
      url.password === "" &&
      url.search === "" &&
      url.hash === "" &&
      url.pathname.startsWith("/")
    );
  } catch {
    return false;
  }
}, "URL must be an exact canonical iJAC HTTPS URL");

const isoTimestamp = z.iso.datetime({ offset: true });
const localizedText = z.object({
  es: z.string().trim().min(1),
  en: z.string().trim().min(1),
  pt: z.string().trim().min(1),
}).strict();
const localizedAliases = z.object({
  es: z.array(z.string().trim().min(1)),
  en: z.array(z.string().trim().min(1)),
  pt: z.array(z.string().trim().min(1)),
}).strict();

export const knowledgeEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "ID must be a stable slug"),
  status: z.enum(knowledgeStatuses),
  owner: z.string().trim().min(1),
  title: localizedText,
  claims: z.array(z.string().trim().min(1)).min(1),
  aliases: localizedAliases,
  tags: z.array(z.string().trim().min(1)).min(1),
  url: canonicalIJacUrl.optional(),
  version: z.number().int().positive(),
  approvedAt: isoTimestamp,
  reviewedAt: isoTimestamp,
  reapprovalDueAt: isoTimestamp,
  validationRules: z.array(z.string().trim().min(1)).optional(),
}).strict();

export type KnowledgeEntry = z.infer<typeof knowledgeEntrySchema>;

export const approvedKnowledgeEntrySchema = knowledgeEntrySchema.refine(
  (entry): entry is KnowledgeEntry & { status: "approved" } => entry.status === "approved",
  { message: "Only approved entries may be evidence" },
).superRefine((entry, context) => {
  if (Date.parse(entry.reviewedAt) < Date.parse(entry.approvedAt)) {
    context.addIssue({ code: "custom", message: "Reviewed timestamp must follow approval" });
  }
  if (!isFreshKnowledgeEntry(entry)) {
    context.addIssue({ code: "custom", message: "Knowledge entry requires reapproval" });
  }
});

export const knowledgeRepositorySchema = z.array(approvedKnowledgeEntrySchema).min(1).superRefine((entries, context) => {
  const ids = new Set<string>();
  entries.forEach((entry, index) => {
    if (ids.has(entry.id)) {
      context.addIssue({ code: "custom", path: [index, "id"], message: "Knowledge IDs must be unique" });
    }
    ids.add(entry.id);
  });
});

export type ApprovedKnowledgeEntry = z.infer<typeof approvedKnowledgeEntrySchema>;
export interface KnowledgeRepository {
  getEntries(): Promise<ApprovedKnowledgeEntry[]>;
}

export function isFreshKnowledgeEntry(entry: KnowledgeEntry, now = new Date()): boolean {
  const nowTimestamp = now.getTime();
  return entry.status === "approved"
    && Date.parse(entry.approvedAt) <= nowTimestamp
    && Date.parse(entry.reviewedAt) <= nowTimestamp
    && Date.parse(entry.reapprovalDueAt) >= nowTimestamp;
}
