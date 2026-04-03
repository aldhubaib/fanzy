import { z } from "zod";
import { factSheetSchema } from "./fact-sheet.js";
import { visualBriefSchema } from "./visual-brief.js";

export const directorBriefInputSchema = z.object({
  projectId: z.string().min(1),
  factSheet: factSheetSchema,
  genre: z.string().optional(),
  targetDuration: z.number().int().positive().optional(),
});

export type DirectorBriefInput = z.infer<typeof directorBriefInputSchema>;

export const directorBriefOutputSchema = visualBriefSchema;

export type DirectorBriefOutput = z.infer<typeof directorBriefOutputSchema>;
