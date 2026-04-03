import { z } from "zod";
import { factSheetSchema } from "./fact-sheet.js";
import { visualBriefSchema } from "./visual-brief.js";
import { scriptSchema } from "./script.js";
import { storyboardSchema } from "./scene.js";

export const directorInputSchema = z.object({
  projectId: z.string().min(1),
  factSheet: factSheetSchema,
  visualBrief: visualBriefSchema,
  script: scriptSchema,
  persona: z.enum(["cinematic", "news"]),
  revisionNotes: z.string().optional(),
});

export type DirectorInput = z.infer<typeof directorInputSchema>;

export const directorOutputSchema = storyboardSchema;

export type DirectorOutput = z.infer<typeof directorInputSchema>;
