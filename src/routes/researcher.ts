import { type Router as RouterType, Router } from "express";
import { z } from "zod";

import { executeResearcher } from "../services/researcher.js";

export const researcherRouter: RouterType = Router();

const paramsSchema = z.object({
  id: z.string().min(1),
});

researcherRouter.post("/projects/:id/research", async (req, res) => {
  try {
    const { id: projectId } = paramsSchema.parse(req.params);

    const result = await executeResearcher(projectId);

    res.status(200).json({
      ok: true,
      data: {
        pipelineRunId: result.pipelineRunId,
        factSheet: result.factSheet,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    const status = message.includes("not found")
      ? 404
      : message.includes("already has a locked FactSheet")
        ? 409
        : 500;

    res.status(status).json({ ok: false, error: message });
  }
});
