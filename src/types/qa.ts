import { z } from "zod";
import { factSheetSchema } from "./fact-sheet.js";
import { visualBriefSchema } from "./visual-brief.js";
import { scriptSchema } from "./script.js";
import { storyboardSchema } from "./scene.js";
import { qaReportSchema } from "./qa-report.js";

export const qaInputSchema = z.object({
  projectId: z.string().min(1),
  factSheet: factSheetSchema,
  visualBrief: visualBriefSchema,
  mergedScript: scriptSchema,
  storyboard: storyboardSchema,
  persona: z.enum(["lawyer", "viewer"]),
  round: z.number().int().positive(),
  previousReport: qaReportSchema.optional(),
});

export type QAInput = z.infer<typeof qaInputSchema>;

export const qaOutputSchema = qaReportSchema;

export type QAOutput = z.infer<typeof qaOutputSchema>;
