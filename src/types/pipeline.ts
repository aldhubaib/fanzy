import { z } from "zod";

export const AGENT_ROLES = [
  "RESEARCHER",
  "DIRECTOR_BRIEF",
  "SCRIPTWRITER_NARRATOR",
  "SCRIPTWRITER_STORYTELLER",
  "EDITOR_MERGE",
  "DIRECTOR_CINEMATIC",
  "DIRECTOR_NEWS",
  "CONTINUITY_CHECKER",
  "QA_LAWYER",
  "QA_VIEWER",
  "EDITOR_FINAL",
] as const;

export type AgentRole = (typeof AGENT_ROLES)[number];

export const PARALLEL_GROUPS: Record<string, AgentRole[]> = {
  scripting: ["SCRIPTWRITER_NARRATOR", "SCRIPTWRITER_STORYTELLER"],
  directing: ["DIRECTOR_CINEMATIC", "DIRECTOR_NEWS"],
  qa: ["QA_LAWYER", "QA_VIEWER"],
};

export const PIPELINE_ORDER: AgentRole[] = [
  "RESEARCHER",
  "DIRECTOR_BRIEF",
  "SCRIPTWRITER_NARRATOR",
  "SCRIPTWRITER_STORYTELLER",
  "EDITOR_MERGE",
  "DIRECTOR_CINEMATIC",
  "DIRECTOR_NEWS",
  "CONTINUITY_CHECKER",
  "QA_LAWYER",
  "QA_VIEWER",
  "EDITOR_FINAL",
];

export const MAX_REVISION_ROUNDS = 3;

export const pipelineEventSchema = z.object({
  executionId: z.string(),
  projectId: z.string(),
  role: z.enum(AGENT_ROLES),
  type: z.enum(["queued", "started", "completed", "failed", "revision"]),
  round: z.number().int().positive(),
  timestamp: z.string().datetime(),
  message: z.string().optional(),
  durationMs: z.number().optional(),
});

export type PipelineEvent = z.infer<typeof pipelineEventSchema>;
