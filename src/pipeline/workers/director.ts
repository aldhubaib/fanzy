import { Worker } from "bullmq";
import { connection } from "../queues.js";
import { createAgentHandler, getAgentOutput } from "../worker-utils.js";
import { prisma } from "../../lib/db.js";
import { runDirector } from "../../agents/director.js";
import type { Script } from "../../types/script.js";
import type { VisualBrief } from "../../types/visual-brief.js";
import type { FactSheet } from "../../types/fact-sheet.js";
import type { AgentJobData } from "../orchestrator.js";

function createDirectorHandler(persona: "cinematic" | "news") {
  const role =
    persona === "cinematic" ? "DIRECTOR_CINEMATIC" : "DIRECTOR_NEWS";

  return createAgentHandler(role, async (data: AgentJobData) => {
    const project = await prisma.project.findUniqueOrThrow({
      where: { id: data.projectId },
      include: { factSheet: true },
    });

    if (!project.factSheet) throw new Error("FactSheet not found");

    const [visualBrief, script] = await Promise.all([
      getAgentOutput<VisualBrief>(data.executionId, "DIRECTOR_BRIEF"),
      getAgentOutput<Script>(data.executionId, "EDITOR_MERGE"),
    ]);

    return runDirector({
      projectId: data.projectId,
      factSheet: project.factSheet as unknown as FactSheet,
      visualBrief,
      script,
      persona,
    });
  });
}

const cinematicHandler = createDirectorHandler("cinematic");
const newsHandler = createDirectorHandler("news");

export const directorCinematicWorker = new Worker<AgentJobData>(
  "pipeline-director_cinematic",
  async (job) => cinematicHandler(job.data),
  { connection, concurrency: 2 },
);

export const directorNewsWorker = new Worker<AgentJobData>(
  "pipeline-director_news",
  async (job) => newsHandler(job.data),
  { connection, concurrency: 2 },
);
