import { Worker } from "bullmq";
import { connection } from "../queues.js";
import { createAgentHandler } from "../worker-utils.js";
import { prisma } from "../../lib/db.js";
import { runDirectorBrief } from "../../agents/director-brief.js";
import type { AgentJobData } from "../orchestrator.js";

const handler = createAgentHandler(
  "DIRECTOR_BRIEF",
  async (data: AgentJobData) => {
    const project = await prisma.project.findUniqueOrThrow({
      where: { id: data.projectId },
      include: { factSheet: true },
    });

    if (!project.factSheet) {
      throw new Error("FactSheet not found — Researcher must complete first");
    }

    const factSheet = project.factSheet;

    return runDirectorBrief({
      projectId: data.projectId,
      factSheet: {
        facts: factSheet.facts as ReturnType<typeof Object>,
        nameRegistry: factSheet.nameRegistry as ReturnType<typeof Object>,
        timeline: factSheet.timeline as ReturnType<typeof Object>,
        locations: factSheet.locations as ReturnType<typeof Object>,
      } as Parameters<typeof runDirectorBrief>[0]["factSheet"],
      genre: project.genre ?? undefined,
      targetDuration: project.targetDuration ?? undefined,
    });
  },
);

export const directorBriefWorker = new Worker<AgentJobData>(
  "pipeline-director_brief",
  async (job) => handler(job.data),
  { connection, concurrency: 2 },
);
