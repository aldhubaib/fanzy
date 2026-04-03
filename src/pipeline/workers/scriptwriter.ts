import { Worker } from "bullmq";
import { connection } from "../queues.js";
import { createAgentHandler, getAgentOutput } from "../worker-utils.js";
import { prisma } from "../../lib/db.js";
import { runScriptwriter } from "../../agents/scriptwriter.js";
import type { VisualBrief } from "../../types/visual-brief.js";
import type { FactSheet } from "../../types/fact-sheet.js";
import type { AgentJobData } from "../orchestrator.js";

function createScriptwriterHandler(persona: "narrator" | "storyteller") {
  const role =
    persona === "narrator"
      ? "SCRIPTWRITER_NARRATOR"
      : "SCRIPTWRITER_STORYTELLER";

  return createAgentHandler(role, async (data: AgentJobData) => {
    const project = await prisma.project.findUniqueOrThrow({
      where: { id: data.projectId },
      include: { factSheet: true },
    });

    if (!project.factSheet) {
      throw new Error("FactSheet not found");
    }

    const visualBrief = await getAgentOutput<VisualBrief>(
      data.executionId,
      "DIRECTOR_BRIEF",
    );

    return runScriptwriter({
      projectId: data.projectId,
      factSheet: project.factSheet as unknown as FactSheet,
      visualBrief,
      persona,
      targetDuration: project.targetDuration ?? undefined,
    });
  });
}

const narratorHandler = createScriptwriterHandler("narrator");
const storytellerHandler = createScriptwriterHandler("storyteller");

export const scriptwriterNarratorWorker = new Worker<AgentJobData>(
  "pipeline-scriptwriter_narrator",
  async (job) => narratorHandler(job.data),
  { connection, concurrency: 2 },
);

export const scriptwriterStorytellerWorker = new Worker<AgentJobData>(
  "pipeline-scriptwriter_storyteller",
  async (job) => storytellerHandler(job.data),
  { connection, concurrency: 2 },
);
