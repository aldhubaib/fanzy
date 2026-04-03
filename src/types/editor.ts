import { z } from "zod";
import { factSheetSchema } from "./fact-sheet.js";
import { scriptSchema } from "./script.js";
import { storyboardSchema } from "./scene.js";
import { qaReportSchema } from "./qa-report.js";

export const editorMergeInputSchema = z.object({
  projectId: z.string().min(1),
  factSheet: factSheetSchema,
  scriptA: scriptSchema,
  scriptB: scriptSchema,
  revisionNotes: z.string().optional(),
});

export type EditorMergeInput = z.infer<typeof editorMergeInputSchema>;

export const editorMergeOutputSchema = scriptSchema;

export type EditorMergeOutput = z.infer<typeof editorMergeOutputSchema>;

export const editorFinalInputSchema = z.object({
  projectId: z.string().min(1),
  factSheet: factSheetSchema,
  storyboard: storyboardSchema,
  qaReports: z.array(qaReportSchema),
  revisionNotes: z.string().optional(),
});

export type EditorFinalInput = z.infer<typeof editorFinalInputSchema>;

export const editorFinalOutputSchema = storyboardSchema;

export type EditorFinalOutput = z.infer<typeof editorFinalOutputSchema>;
