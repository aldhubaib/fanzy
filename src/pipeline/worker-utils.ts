import { prisma } from "../lib/db.js";
import { pipelineEvents } from "./events.js";
import { onAgentComplete, onAgentFailed, type AgentJobData } from "./orchestrator.js";
import type { AgentRole } from "../types/pipeline.js";

/**
 * Wraps an agent execution function with standard lifecycle:
 * mark running → run agent → save output → trigger next step.
 */
export function createAgentHandler<TOutput>(
  role: AgentRole,
  execute: (data: AgentJobData) => Promise<TOutput>,
) {
  return async (data: AgentJobData): Promise<void> => {
    const startTime = Date.now();

    await prisma.agentRun.update({
      where: { id: data.agentRunId },
      data: { status: "RUNNING", startedAt: new Date() },
    });

    pipelineEvents.emit("pipeline", {
      executionId: data.executionId,
      projectId: data.projectId,
      role,
      type: "started",
      round: data.round,
      timestamp: new Date().toISOString(),
    });

    try {
      const output = await execute(data);
      const durationMs = Date.now() - startTime;

      await prisma.agentRun.update({
        where: { id: data.agentRunId },
        data: {
          status: "COMPLETED",
          output: output as object,
          durationMs,
          endedAt: new Date(),
        },
      });

      pipelineEvents.emit("pipeline", {
        executionId: data.executionId,
        projectId: data.projectId,
        role,
        type: "completed",
        round: data.round,
        timestamp: new Date().toISOString(),
        durationMs,
      });

      await onAgentComplete(
        data.executionId,
        data.projectId,
        role,
        data.round,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      const durationMs = Date.now() - startTime;

      await prisma.agentRun.update({
        where: { id: data.agentRunId },
        data: {
          status: "FAILED",
          error: message,
          durationMs,
          endedAt: new Date(),
        },
      });

      await onAgentFailed(data.executionId, data.projectId, role, message);

      throw error;
    }
  };
}

/**
 * Gets the latest completed output for a given role in an execution.
 */
export async function getAgentOutput<T>(
  executionId: string,
  role: AgentRole,
): Promise<T> {
  const run = await prisma.agentRun.findFirst({
    where: { executionId, role, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
  });

  if (!run?.output) {
    throw new Error(`No completed output for ${role} in execution ${executionId}`);
  }

  return run.output as T;
}
