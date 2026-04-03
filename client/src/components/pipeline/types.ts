export type AgentStatus = "pending" | "running" | "done" | "revision" | "failed";

export type AgentRole =
  | "researcher"
  | "brief"
  | "scriptwriter-a"
  | "scriptwriter-b"
  | "editor-merge"
  | "director-a"
  | "director-b"
  | "continuity"
  | "qa-lawyer"
  | "qa-viewer"
  | "editor-final";

export type QAIssueSeverity = "critical" | "minor";

export interface QAIssue {
  targetAgent: string;
  issueType: string;
  severity: QAIssueSeverity;
  description: string;
  resolved: boolean;
  location?: { act?: number; beat?: number; scene?: number };
}

export interface AgentOutput {
  tags?: string[];
  text?: string;
  arabicText?: string;
  issues?: QAIssue[];
  scenes?: SceneCard[];
}

export interface SceneCard {
  number: number;
  shotType: string;
  description: string;
  descriptionAr?: string;
  tags: string[];
}

export interface AgentNode {
  id: string;
  role: AgentRole;
  name: string;
  icon: string;
  subtitle?: string;
  status: AgentStatus;
  durationMs?: number;
  output?: AgentOutput;
  revisionNote?: string;
}

export interface PipelinePhase {
  id: string;
  label?: string;
  type: "single" | "parallel";
  agents: AgentNode[];
  mergeAgent?: AgentNode;
  approvalText?: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  agent: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "start";
}

export interface PipelineData {
  status: "pending" | "running" | "complete" | "complete_with_warnings" | "failed";
  phases: PipelinePhase[];
  activity: ActivityEvent[];
  stats: {
    done: number;
    revised: number;
    rounds: number;
    totalTimeMs: number;
  };
}
