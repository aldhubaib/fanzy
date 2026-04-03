import { type Router as RouterType, Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/db.js";
import { resolveUser } from "../middleware/resolve-user.js";
import { startPipeline } from "../pipeline/orchestrator.js";
import { pipelineEvents } from "../pipeline/events.js";

export const pipelineRouter: RouterType = Router();

pipelineRouter.use(resolveUser);

const paramsSchema = z.object({
  id: z.string().min(1),
});

pipelineRouter.post("/projects/:id/pipeline/start", async (req, res) => {
  try {
    const { id: projectId } = paramsSchema.parse(req.params);

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.dbUser!.id },
    });

    if (!project) {
      res.status(404).json({ ok: false, error: "Project not found" });
      return;
    }

    const activeExecution = await prisma.pipelineExecution.findFirst({
      where: { projectId, status: "RUNNING" },
    });

    if (activeExecution) {
      res.status(409).json({
        ok: false,
        error: "Pipeline already running",
        executionId: activeExecution.id,
      });
      return;
    }

    const executionId = await startPipeline(projectId);

    res.status(201).json({ ok: true, data: { executionId } });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start pipeline";
    res.status(500).json({ ok: false, error: message });
  }
});

pipelineRouter.get("/projects/:id/pipeline/status", async (req, res) => {
  try {
    const { id: projectId } = paramsSchema.parse(req.params);

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.dbUser!.id },
    });

    if (!project) {
      res.status(404).json({ ok: false, error: "Project not found" });
      return;
    }

    const execution = await prisma.pipelineExecution.findFirst({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        agentRuns: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!execution) {
      res.status(404).json({ ok: false, error: "No pipeline runs found" });
      return;
    }

    res.json({ ok: true, data: execution });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get pipeline status";
    res.status(500).json({ ok: false, error: message });
  }
});

pipelineRouter.get("/projects/:id/pipeline/events", async (req, res) => {
  try {
    const { id: projectId } = paramsSchema.parse(req.params);

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.dbUser!.id },
    });

    if (!project) {
      res.status(404).json({ ok: false, error: "Project not found" });
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    res.write("data: {\"type\":\"connected\"}\n\n");

    const onEvent = (event: unknown) => {
      const data = event as { projectId: string };
      if (data.projectId === projectId) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    };

    pipelineEvents.on("pipeline", onEvent);

    const heartbeat = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, 15_000);

    req.on("close", () => {
      clearInterval(heartbeat);
      pipelineEvents.removeListener("pipeline", onEvent);
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to connect to events";
    res.status(500).json({ ok: false, error: message });
  }
});
