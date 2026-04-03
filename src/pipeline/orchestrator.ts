import { prisma } from "../lib/db.js";
import { queues } from "./queues.js";
import { pipelineEvents } from "./events.js";
import {
  PARALLEL_GROUPS,
  MAX_REVISION_ROUNDS,
  type AgentRole,
} from "../types/pipeline.js";
import type { QAReport } from "../types/qa-report.js";

interface AgentJobData {
  executionId: string;
  projectId: string;
  agentRunId: string;
  round: number;
}

function emitEvent(
  data: AgentJobData,
  role: AgentRole,
  type: "queued" | "started" | "completed" | "failed" | "revision",
  extra?: { message?: string; durationMs?: number },
) {
  pipelineEvents.emit("pipeline", {
    executionId: data.executionId,
    projectId: data.projectId,
    role,
    type,
    round: data.round,
    timestamp: new Date().toISOString(),
    ...extra,
  });
}

export async function startPipeline(projectId: string): Promise<string> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { factSheet: true },
  });

  if (!project) throw new Error(`Project not found: ${projectId}`);

  const execution = await prisma.pipelineExecution.create({
    data: {
      projectId,
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  if (project.factSheet) {
    await enqueueAgent(execution.id, projectId, "DIRECTOR_BRIEF", 1);
  } else {
    await enqueueAgent(execution.id, projectId, "RESEARCHER", 1);
  }

  return execution.id;
}

async function enqueueAgent(
  executionId: string,
  projectId: string,
  role: AgentRole,
  round: number,
): Promise<void> {
  const agentRun = await prisma.agentRun.create({
    data: {
      executionId,
      role,
      status: "QUEUED",
      round,
    },
  });

  const jobData: AgentJobData = {
    executionId,
    projectId,
    agentRunId: agentRun.id,
    round,
  };

  await queues[role].add(role, jobData, { jobId: agentRun.id });

  emitEvent(jobData, role, "queued");
}

async function enqueueParallel(
  executionId: string,
  projectId: string,
  roles: AgentRole[],
  round: number,
): Promise<void> {
  await Promise.all(
    roles.map((role) => enqueueAgent(executionId, projectId, role, round)),
  );
}

async function checkParallelGroupComplete(
  executionId: string,
  completedRole: AgentRole,
): Promise<boolean> {
  const group = Object.values(PARALLEL_GROUPS).find((roles) =>
    roles.includes(completedRole),
  );
  if (!group) return true;

  const runs = await prisma.agentRun.findMany({
    where: {
      executionId,
      role: { in: group },
      status: "COMPLETED",
    },
  });

  return runs.length >= group.length;
}

/**
 * Called by each worker when an agent completes successfully.
 * Determines and enqueues the next step in the pipeline.
 */
export async function onAgentComplete(
  executionId: string,
  projectId: string,
  role: AgentRole,
  round: number,
): Promise<void> {
  const groupDone = await checkParallelGroupComplete(executionId, role);
  if (!groupDone) return;

  switch (role) {
    case "RESEARCHER":
      await enqueueAgent(executionId, projectId, "DIRECTOR_BRIEF", round);
      break;

    case "DIRECTOR_BRIEF":
      await enqueueParallel(
        executionId,
        projectId,
        PARALLEL_GROUPS.scripting,
        round,
      );
      break;

    case "SCRIPTWRITER_NARRATOR":
    case "SCRIPTWRITER_STORYTELLER":
      await enqueueAgent(executionId, projectId, "EDITOR_MERGE", round);
      break;

    case "EDITOR_MERGE":
      await enqueueParallel(
        executionId,
        projectId,
        PARALLEL_GROUPS.directing,
        round,
      );
      break;

    case "DIRECTOR_CINEMATIC":
    case "DIRECTOR_NEWS":
      await enqueueAgent(
        executionId,
        projectId,
        "CONTINUITY_CHECKER",
        round,
      );
      break;

    case "CONTINUITY_CHECKER":
      await enqueueParallel(
        executionId,
        projectId,
        PARALLEL_GROUPS.qa,
        round,
      );
      break;

    case "QA_LAWYER":
    case "QA_VIEWER":
      await handleQAComplete(executionId, projectId, round);
      break;

    case "EDITOR_FINAL":
      await completePipeline(executionId, projectId);
      break;
  }
}

async function handleQAComplete(
  executionId: string,
  projectId: string,
  round: number,
): Promise<void> {
  const qaRuns = await prisma.agentRun.findMany({
    where: {
      executionId,
      role: { in: ["QA_LAWYER", "QA_VIEWER"] },
      round,
      status: "COMPLETED",
    },
  });

  const reports = qaRuns
    .map((run) => run.output as unknown as QAReport)
    .filter(Boolean);

  const allPassed = reports.every((r) => r.passed);
  const hasCritical = reports.some((r) =>
    r.issues.some((i) => i.severity === "critical"),
  );

  if (allPassed || round >= MAX_REVISION_ROUNDS) {
    await enqueueAgent(executionId, projectId, "EDITOR_FINAL", round);
    return;
  }

  if (hasCritical) {
    const nextRound = round + 1;

    await prisma.pipelineExecution.update({
      where: { id: executionId },
      data: { round: nextRound },
    });

    const targetsToRevise = new Set<AgentRole>();
    for (const report of reports) {
      for (const issue of report.issues) {
        if (issue.severity !== "minor") {
          targetsToRevise.add(issue.targetAgent);
        }
      }
    }

    const revisionStart = findEarliestRevisionPoint([...targetsToRevise]);

    pipelineEvents.emit("pipeline", {
      executionId,
      projectId,
      role: "QA_LAWYER",
      type: "revision",
      round: nextRound,
      timestamp: new Date().toISOString(),
      message: `QA found issues — revision round ${nextRound}, restarting from ${revisionStart}`,
    });

    await routeRevision(executionId, projectId, revisionStart, nextRound);
  } else {
    await enqueueAgent(executionId, projectId, "EDITOR_FINAL", round);
  }
}

const REVISION_PRIORITY: AgentRole[] = [
  "SCRIPTWRITER_NARRATOR",
  "SCRIPTWRITER_STORYTELLER",
  "EDITOR_MERGE",
  "DIRECTOR_CINEMATIC",
  "DIRECTOR_NEWS",
  "CONTINUITY_CHECKER",
];

function findEarliestRevisionPoint(targets: AgentRole[]): AgentRole {
  for (const role of REVISION_PRIORITY) {
    if (targets.includes(role)) return role;
  }
  return "EDITOR_MERGE";
}

async function routeRevision(
  executionId: string,
  projectId: string,
  startFrom: AgentRole,
  round: number,
): Promise<void> {
  if (
    startFrom === "SCRIPTWRITER_NARRATOR" ||
    startFrom === "SCRIPTWRITER_STORYTELLER"
  ) {
    await enqueueParallel(
      executionId,
      projectId,
      PARALLEL_GROUPS.scripting,
      round,
    );
  } else if (startFrom === "EDITOR_MERGE") {
    await enqueueAgent(executionId, projectId, "EDITOR_MERGE", round);
  } else if (
    startFrom === "DIRECTOR_CINEMATIC" ||
    startFrom === "DIRECTOR_NEWS"
  ) {
    await enqueueParallel(
      executionId,
      projectId,
      PARALLEL_GROUPS.directing,
      round,
    );
  } else {
    await enqueueAgent(executionId, projectId, startFrom, round);
  }
}

async function completePipeline(
  executionId: string,
  projectId: string,
): Promise<void> {
  await prisma.$transaction([
    prisma.pipelineExecution.update({
      where: { id: executionId },
      data: { status: "COMPLETED", endedAt: new Date() },
    }),
    prisma.project.update({
      where: { id: projectId },
      data: { status: "COMPLETED" },
    }),
  ]);

  pipelineEvents.emit("pipeline", {
    executionId,
    projectId,
    role: "EDITOR_FINAL",
    type: "completed",
    round: 1,
    timestamp: new Date().toISOString(),
    message: "Pipeline complete — production-ready storyboard generated",
  });
}

export async function onAgentFailed(
  executionId: string,
  projectId: string,
  role: AgentRole,
  error: string,
): Promise<void> {
  await prisma.$transaction([
    prisma.pipelineExecution.update({
      where: { id: executionId },
      data: { status: "FAILED", endedAt: new Date(), error },
    }),
    prisma.project.update({
      where: { id: projectId },
      data: { status: "FAILED" },
    }),
  ]);

  pipelineEvents.emit("pipeline", {
    executionId,
    projectId,
    role,
    type: "failed",
    round: 1,
    timestamp: new Date().toISOString(),
    message: error,
  });
}

export type { AgentJobData };
