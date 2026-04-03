import { Worker } from "bullmq";
import { connection } from "../queues.js";
import { createAgentHandler, getAgentOutput } from "../worker-utils.js";
import { prisma } from "../../lib/db.js";
import { runEditorMerge, runEditorFinal } from "../../agents/editor.js";
import type { Script } from "../../types/script.js";
import type { Storyboard } from "../../types/scene.js";
import type { QAReport } from "../../types/qa-report.js";
import type { FactSheet } from "../../types/fact-sheet.js";
import type { AgentJobData } from "../orchestrator.js";

const mergeHandler = createAgentHandler(
  "EDITOR_MERGE",
  async (data: AgentJobData) => {
    const project = await prisma.project.findUniqueOrThrow({
      where: { id: data.projectId },
      include: { factSheet: true },
    });

    if (!project.factSheet) throw new Error("FactSheet not found");

    const [scriptA, scriptB] = await Promise.all([
      getAgentOutput<Script>(data.executionId, "SCRIPTWRITER_NARRATOR"),
      getAgentOutput<Script>(data.executionId, "SCRIPTWRITER_STORYTELLER"),
    ]);

    return runEditorMerge({
      projectId: data.projectId,
      factSheet: project.factSheet as unknown as FactSheet,
      scriptA,
      scriptB,
    });
  },
);

const finalHandler = createAgentHandler(
  "EDITOR_FINAL",
  async (data: AgentJobData) => {
    const project = await prisma.project.findUniqueOrThrow({
      where: { id: data.projectId },
      include: { factSheet: true },
    });

    if (!project.factSheet) throw new Error("FactSheet not found");

    const storyboard = await getAgentOutput<Storyboard>(
      data.executionId,
      "CONTINUITY_CHECKER",
    );

    const qaRuns = await prisma.agentRun.findMany({
      where: {
        executionId: data.executionId,
        role: { in: ["QA_LAWYER", "QA_VIEWER"] },
        status: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
      take: 2,
    });

    const qaReports = qaRuns
      .map((r) => r.output as unknown as QAReport)
      .filter(Boolean);

    const result = await runEditorFinal({
      projectId: data.projectId,
      factSheet: project.factSheet as unknown as FactSheet,
      storyboard,
      qaReports,
    });

    await prisma.storyboard.upsert({
      where: { projectId: data.projectId },
      create: {
        projectId: data.projectId,
        scenes: result.scenes,
      },
      update: {
        scenes: result.scenes,
        version: { increment: 1 },
      },
    });

    return result;
  },
);

export const editorMergeWorker = new Worker<AgentJobData>(
  "pipeline-editor_merge",
  async (job) => mergeHandler(job.data),
  { connection, concurrency: 2 },
);

export const editorFinalWorker = new Worker<AgentJobData>(
  "pipeline-editor_final",
  async (job) => finalHandler(job.data),
  { connection, concurrency: 1 },
);
