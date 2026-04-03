import { z } from "zod";

import { factSheetSchema } from "./fact-sheet.js";

// --- Researcher Input ---

export const researcherInputSchema = z.object({
  projectId: z.string().min(1),
  sourceText: z.string().min(50, "Source text must be at least 50 characters"),
  genre: z.string().optional(),
  dialect: z.string().optional(),
});

export type ResearcherInput = z.infer<typeof researcherInputSchema>;

// --- Researcher Output ---

export const researcherOutputSchema = factSheetSchema;

export type ResearcherOutput = z.infer<typeof researcherOutputSchema>;
