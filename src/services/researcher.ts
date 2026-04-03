import { prisma } from "../lib/db.js";
import { runResearcher } from "../agents/researcher.js";
import { researcherInputSchema } from "../types/researcher.js";
import type { FactSheet } from "../types/fact-sheet.js";

interface ResearchResult {
  factSheet: FactSheet;
  pipelineRunId: string;
}

export async function executeResearcher(
  projectId: string,
): Promise<ResearchResult> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { factSheet: true },
  });

  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  if (project.factSheet) {
    throw new Error(
      `Project ${projectId} already has a locked FactSheet — cannot re-research`,
    );
  }

  const pipelineRun = await prisma.pipelineRun.create({
    data: {
      projectId,
      stage: "RESEARCHER",
      status: "PROCESSING",
      input: { sourceText: project.sourceText, genre: project.genre },
      startedAt: new Date(),
    },
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { status: "RESEARCHING" },
  });

  try {
    const input = researcherInputSchema.parse({
      projectId,
      sourceText: project.sourceText,
      genre: project.genre ?? undefined,
      dialect: project.dialect ?? undefined,
    });

    const factSheet = await runResearcher(input);

    await prisma.$transaction([
      prisma.factSheet.create({
        data: {
          projectId,
          facts: factSheet.facts,
          nameRegistry: factSheet.nameRegistry,
          timeline: factSheet.timeline,
          locations: factSheet.locations,
        },
      }),
      prisma.pipelineRun.update({
        where: { id: pipelineRun.id },
        data: {
          status: "COMPLETED",
          output: factSheet,
          endedAt: new Date(),
        },
      }),
      prisma.project.update({
        where: { id: projectId },
        data: { status: "WRITING" },
      }),
    ]);

    return { factSheet, pipelineRunId: pipelineRun.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error in Researcher";

    await prisma.pipelineRun.update({
      where: { id: pipelineRun.id },
      data: {
        status: "FAILED",
        error: message,
        endedAt: new Date(),
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { status: "FAILED" },
    });

    throw new Error(`Researcher failed for project ${projectId}: ${message}`);
  }
}
