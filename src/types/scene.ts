import { z } from "zod";
import { dialogueLineSchema } from "./script.js";

export const sceneCardSchema = z.object({
  sceneNumber: z.number().int().positive(),
  shotType: z.string().min(1),
  cameraMovement: z.string().min(1),
  cameraAngle: z.string().min(1),
  composition: z.string().min(1),
  lighting: z.string().min(1),
  subjects: z.array(z.string()).min(1),
  action: z.string().min(1),
  narration: z.string().default(""),
  dialogue: z.array(dialogueLineSchema).default([]),
  durationSeconds: z.number().positive(),
  transition: z.string().default("قطع"),
  notes: z.string().default(""),
});

export const storyboardSchema = z.object({
  scenes: z.array(sceneCardSchema).min(1),
  totalDurationSeconds: z.number().positive(),
  persona: z.enum(["cinematic", "news"]).optional(),
});

export type SceneCard = z.infer<typeof sceneCardSchema>;
export type Storyboard = z.infer<typeof storyboardSchema>;
