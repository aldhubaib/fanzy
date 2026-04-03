import { z } from "zod";
import { factSheetSchema } from "./fact-sheet.js";
import { storyboardSchema } from "./scene.js";

export const continuityInputSchema = z.object({
  projectId: z.string().min(1),
  factSheet: factSheetSchema,
  storyboardA: storyboardSchema,
  storyboardB: storyboardSchema,
  revisionNotes: z.string().optional(),
});

export type ContinuityInput = z.infer<typeof continuityInputSchema>;

export const continuityOutputSchema = storyboardSchema;

export type ContinuityOutput = z.infer<typeof continuityOutputSchema>;
