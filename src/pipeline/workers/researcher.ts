import { Worker } from "bullmq";
import { connection } from "../queues.js";
import { createAgentHandler, getAgentOutput } from "../worker-utils.js";
import { prisma } from "../../lib/db.js";
import { runResearcher } from "../../agents/researcher.js";
import { researcherInputSchema } from "../../types/researcher.js";
import type { FactSheet } from "../../types/fact-sheet.js";
import type { AgentJobData } from "../orchestrator.js";

const handler = createAgentHandler("RESEARCHER", async (data: AgentJobData) => {
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: data.projectId },
  });

  const input = researcherInputSchema.parse({
    projectId: project.id,
    sourceText: project.sourceText,
    genre: project.genre ?? undefined,
    dialect: project.dialect ?? undefined,
  });

  const factSheet = await runResearcher(input);

  await prisma.$transaction([
    prisma.factSheet.create({
      data: {
        projectId: data.projectId,
        facts: factSheet.facts,
        nameRegistry: factSheet.nameRegistry,
        timeline: factSheet.timeline,
        locations: factSheet.locations,
      },
    }),
    prisma.project.update({
      where: { id: data.projectId },
      data: { status: "RESEARCHING" },
    }),
  ]);

  return factSheet;
});

export const researcherWorker = new Worker<AgentJobData>(
  "pipeline-researcher",
  async (job) => handler(job.data),
  { connection, concurrency: 2 },
);
