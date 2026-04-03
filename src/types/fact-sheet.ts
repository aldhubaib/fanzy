import { z } from "zod";

// --- Name Registry ---

export const nameEntrySchema = z.object({
  /** Canonical Arabic name — the single authoritative spelling */
  canonical: z.string().min(1),
  /** Known aliases, nicknames, or spelling variants */
  variants: z.array(z.string()).default([]),
  /** Brief role description (e.g. "البطل", "الأم", "الراوي") */
  role: z.string().min(1),
});

export const nameRegistrySchema = z.array(nameEntrySchema).min(1);

// --- Core Facts ---

export const factEntrySchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  /** Which source section this fact was extracted from */
  source: z.string().optional(),
});

export const factsSchema = z.array(factEntrySchema).min(1);

// --- Timeline ---

export const timelineEventSchema = z.object({
  order: z.number().int().nonnegative(),
  description: z.string().min(1),
  characters: z.array(z.string()).default([]),
});

export const timelineSchema = z.array(timelineEventSchema).min(1);

// --- Locations ---

export const locationSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  /** Which timeline events reference this location */
  events: z.array(z.number().int().nonnegative()).default([]),
});

export const locationsSchema = z.array(locationSchema);

// --- Full Fact Sheet (agent output) ---

export const factSheetSchema = z.object({
  genre: z.string().min(1),
  facts: factsSchema,
  nameRegistry: nameRegistrySchema,
  timeline: timelineSchema,
  locations: locationsSchema,
});

// --- Inferred types ---

export type NameEntry = z.infer<typeof nameEntrySchema>;
export type NameRegistry = z.infer<typeof nameRegistrySchema>;
export type FactEntry = z.infer<typeof factEntrySchema>;
export type Facts = z.infer<typeof factsSchema>;
export type TimelineEvent = z.infer<typeof timelineEventSchema>;
export type Timeline = z.infer<typeof timelineSchema>;
export type Location = z.infer<typeof locationSchema>;
export type FactSheet = z.infer<typeof factSheetSchema>;
