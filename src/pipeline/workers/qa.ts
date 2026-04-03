import { Worker } from "bullmq";
import { connection } from "../queues.js";
import { createAgentHandler, getAgentOutput } from "../worker-utils.js";
import { prisma } from "../../lib/db.js";
import { runQA } from "../../agents/qa.js";
import type { Script } from "../../types/script.js";
import type { Storyboard } from "../../types/scene.js";
import type { VisualBrief } from "../../types/visual-brief.js";
import type { QAReport } from "../../types/qa-report.js";
import type { FactSheet } from "../../types/fact-sheet.js";
import type { AgentJobData } from "../orchestrator.js";

function createQAHandler(persona: "lawyer" | "viewer") {
  const role = persona === "lawyer" ? "QA_LAWYER" : "QA_VIEWER";

  return createAgentHandler(role, async (data: AgentJobData) => {
    const project = await prisma.project.findUniqueOrThrow({
      where: { id: data.projectId },
      include: { factSheet: true },
    });

    if (!project.factSheet) throw new Error("FactSheet not found");

    const [visualBrief, mergedScript, storyboard] = await Promise.all([
      getAgentOutput<VisualBrief>(data.executionId, "DIRECTOR_BRIEF"),
      getAgentOutput<Script>(data.executionId, "EDITOR_MERGE"),
      getAgentOutput<Storyboard>(data.executionId, "CONTINUITY_CHECKER"),
    ]);

    let previousReport: QAReport | undefined;
    if (data.round > 1) {
      const prevRun = await prisma.agentRun.findFirst({
        where: {
          executionId: data.executionId,
          role,
          round: data.round - 1,
          status: "COMPLETED",
        },
      });
      if (prevRun?.output) {
        previousReport = prevRun.output as unknown as QAReport;
      }
    }

    return runQA({
      projectId: data.projectId,
      factSheet: project.factSheet as unknown as FactSheet,
      visualBrief,
      mergedScript,
      storyboard,
      persona,
      round: data.round,
      previousReport,
    });
  });
}

const lawyerHandler = createQAHandler("lawyer");
const viewerHandler = createQAHandler("viewer");

export const qaLawyerWorker = new Worker<AgentJobData>(
  "pipeline-qa_lawyer",
  async (job) => lawyerHandler(job.data),
  { connection, concurrency: 2 },
);

export const qaViewerWorker = new Worker<AgentJobData>(
  "pipeline-qa_viewer",
  async (job) => viewerHandler(job.data),
  { connection, concurrency: 2 },
);
