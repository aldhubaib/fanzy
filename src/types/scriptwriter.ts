import { z } from "zod";
import { factSheetSchema } from "./fact-sheet.js";
import { visualBriefSchema } from "./visual-brief.js";
import { scriptSchema } from "./script.js";

export const scriptwriterInputSchema = z.object({
  projectId: z.string().min(1),
  factSheet: factSheetSchema,
  visualBrief: visualBriefSchema,
  persona: z.enum(["narrator", "storyteller"]),
  targetDuration: z.number().int().positive().optional(),
  revisionNotes: z.string().optional(),
});

export type ScriptwriterInput = z.infer<typeof scriptwriterInputSchema>;

export const scriptwriterOutputSchema = scriptSchema;

export type ScriptwriterOutput = z.infer<typeof scriptwriterOutputSchema>;
