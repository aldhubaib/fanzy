import { z } from "zod";
import { AGENT_ROLES } from "./pipeline.js";

export const qaIssueSchema = z.object({
  severity: z.enum(["critical", "major", "minor"]),
  category: z.string().min(1),
  location: z.string().min(1),
  description: z.string().min(1),
  suggestion: z.string().min(1),
  targetAgent: z.enum(AGENT_ROLES),
});

export const qaReportSchema = z.object({
  persona: z.enum(["lawyer", "viewer"]),
  overallScore: z.number().min(1).max(10),
  passed: z.boolean(),
  issues: z.array(qaIssueSchema),
  summary: z.string().min(1),
});

export type QAIssue = z.infer<typeof qaIssueSchema>;
export type QAReport = z.infer<typeof qaReportSchema>;
