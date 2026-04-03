import { z } from "zod";

// --- Enums ---

export const DIALECTS = [
  "kuwaiti",
  "gulf",
  "egyptian",
  "levantine",
  "moroccan",
  "msa",
] as const;

export const NARRATOR_ROLES = [
  "in_shot",
  "voice_over",
  "none",
] as const;

export const GENRES = [
  "true_crime",
  "mystery",
  "documentary",
  "drama",
  "comedy",
  "historical",
  "social",
] as const;

// --- Dialogue Rules ---

export const dialogueRulesSchema = z.object({
  /** Who is allowed to speak (e.g. only narrator, or all characters) */
  speakerPolicy: z.enum(["narrator_only", "narrator_and_sources", "all"]),
  /** Max spoken lines per block (e.g. 5 for e3wais) */
  maxLinesPerBlock: z.number().int().positive().default(5),
  /** One clear point per line — no padding */
  brevity: z.enum(["strict", "moderate", "relaxed"]).default("strict"),
  /** Extra rules as free text (e.g. "no invented dialogue for real people") */
  extraRules: z.array(z.string()).default([]),
});

// --- Narrative Flow ---

export const narrativeFlowSchema = z.object({
  /**
   * Ordered list of story beats (e.g. ["hook", "motive", "crime", "cover_up",
   * "discovery", "clues", "exposure", "punishment", "reflection"])
   */
  beats: z.array(z.string().min(1)).min(1),
  /** Whether the flow is strictly linear or allows flashbacks/nonlinear */
  structure: z.enum(["linear", "nonlinear", "end_first"]).default("linear"),
});

// --- QA Rules ---

export const qaRulesSchema = z.object({
  /** Source fidelity — reject any content not from the provided source */
  sourceOnly: z.boolean().default(true),
  /** Check that every name matches the Name Registry exactly */
  strictNameAccuracy: z.boolean().default(true),
  /** Enforce dialogue brevity limits */
  checkBrevity: z.boolean().default(true),
  /** Enforce script format compliance */
  checkFormat: z.boolean().default(true),
  /** Extra checks as free text */
  extraChecks: z.array(z.string()).default([]),
});

// --- Script Format Template ---

export const scriptFormatBlockSchema = z.object({
  /** Label for this block section (e.g. "الشوت", "مكان e3wais", "e3wais يقول:") */
  label: z.string().min(1),
  /** What goes in this section */
  description: z.string().min(1),
  /** Whether this section is required in every block */
  required: z.boolean().default(true),
});

export const scriptFormatSchema = z.object({
  /** Whether blocks are time-ranged (e.g. "[00:00 - 00:30]") */
  hasTimeRange: z.boolean().default(true),
  /** Ordered sections within each block */
  blocks: z.array(scriptFormatBlockSchema).min(1),
});

// --- Full Creator Profile ---

export const creatorProfileSchema = z.object({
  name: z.string().min(1),
  dialect: z.enum(DIALECTS),
  tone: z.string().min(1),
  narratorRole: z.enum(NARRATOR_ROLES),
  genre: z.enum(GENRES),
  scriptFormat: scriptFormatSchema,
  dialogueRules: dialogueRulesSchema,
  narrativeFlow: narrativeFlowSchema,
  qaRules: qaRulesSchema,
});

// --- API Input (create / update) ---

export const createProfileInputSchema = creatorProfileSchema;

export const updateProfileInputSchema = creatorProfileSchema.partial();

// --- Inferred Types ---

export type Dialect = (typeof DIALECTS)[number];
export type NarratorRole = (typeof NARRATOR_ROLES)[number];
export type Genre = (typeof GENRES)[number];
export type DialogueRules = z.infer<typeof dialogueRulesSchema>;
export type NarrativeFlow = z.infer<typeof narrativeFlowSchema>;
export type QARules = z.infer<typeof qaRulesSchema>;
export type ScriptFormatBlock = z.infer<typeof scriptFormatBlockSchema>;
export type ScriptFormat = z.infer<typeof scriptFormatSchema>;
export type CreatorProfile = z.infer<typeof creatorProfileSchema>;
