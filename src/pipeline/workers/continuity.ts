import { Worker } from "bullmq";
import { connection } from "../queues.js";
import { createAgentHandler, getAgentOutput } from "../worker-utils.js";
import { prisma } from "../../lib/db.js";
import { runContinuityChecker } from "../../agents/continuity.js";
import type { Storyboard } from "../../types/scene.js";
import type { FactSheet } from "../../types/fact-sheet.js";
import type { AgentJobData } from "../orchestrator.js";

const handler = createAgentHandler(
  "CONTINUITY_CHECKER",
  async (data: AgentJobData) => {
    const project = await prisma.project.findUniqueOrThrow({
      where: { id: data.projectId },
      include: { factSheet: true },
    });

    if (!project.factSheet) throw new Error("FactSheet not found");

    const [storyboardA, storyboardB] = await Promise.all([
      getAgentOutput<Storyboard>(data.executionId, "DIRECTOR_CINEMATIC"),
      getAgentOutput<Storyboard>(data.executionId, "DIRECTOR_NEWS"),
    ]);

    return runContinuityChecker({
      projectId: data.projectId,
      factSheet: project.factSheet as unknown as FactSheet,
      storyboardA,
      storyboardB,
    });
  },
);

export const continuityWorker = new Worker<AgentJobData>(
  "pipeline-continuity_checker",
  async (job) => handler(job.data),
  { connection, concurrency: 2 },
);
