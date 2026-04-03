import { z } from "zod";

export const locationSetupSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  mood: z.string().min(1),
});

export const visualBriefSchema = z.object({
  tone: z.string().min(1),
  colorPalette: z.array(z.string()).min(1),
  cameraStyle: z.string().min(1),
  lightingNotes: z.string().min(1),
  locationSetups: z.array(locationSetupSchema).min(1),
  paceGuidance: z.string().min(1),
  targetAudience: z.string().min(1),
  references: z.array(z.string()).default([]),
});

export type LocationSetup = z.infer<typeof locationSetupSchema>;
export type VisualBrief = z.infer<typeof visualBriefSchema>;
