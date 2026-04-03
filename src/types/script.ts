import { z } from "zod";

export const dialogueLineSchema = z.object({
  character: z.string().min(1),
  line: z.string().min(1),
});

export const sceneScriptSchema = z.object({
  sceneNumber: z.number().int().positive(),
  location: z.string().min(1),
  timeOfDay: z.string().min(1),
  narration: z.string().default(""),
  dialogue: z.array(dialogueLineSchema).default([]),
  actionNotes: z.string().default(""),
  durationSeconds: z.number().positive(),
});

export const actSchema = z.object({
  actNumber: z.number().int().positive(),
  title: z.string().min(1),
  scenes: z.array(sceneScriptSchema).min(1),
});

export const scriptSchema = z.object({
  acts: z.array(actSchema).min(1),
  totalDurationSeconds: z.number().positive(),
  persona: z.enum(["narrator", "storyteller"]),
});

export type DialogueLine = z.infer<typeof dialogueLineSchema>;
export type SceneScript = z.infer<typeof sceneScriptSchema>;
export type Act = z.infer<typeof actSchema>;
export type Script = z.infer<typeof scriptSchema>;
