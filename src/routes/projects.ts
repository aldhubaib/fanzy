import { type Router as RouterType, Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/db.js";
import { resolveUser } from "../middleware/resolve-user.js";

export const projectsRouter: RouterType = Router();

projectsRouter.use(resolveUser);

const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  sourceText: z.string().min(50, "النص يجب أن يكون 50 حرفاً على الأقل"),
  genre: z.string().optional(),
  dialect: z.string().optional(),
  targetDuration: z.number().int().positive().optional(),
});

projectsRouter.get("/projects", async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.dbUser!.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        genre: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ ok: true, data: projects });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list projects";
    res.status(500).json({ ok: false, error: message });
  }
});

projectsRouter.post("/projects", async (req, res) => {
  try {
    const body = createProjectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        ...body,
        userId: req.dbUser!.id,
      },
    });

    res.status(201).json({ ok: true, data: project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ ok: false, error: error.errors });
      return;
    }
    const message =
      error instanceof Error ? error.message : "Failed to create project";
    res.status(500).json({ ok: false, error: message });
  }
});

projectsRouter.get("/projects/:id", async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.dbUser!.id,
      },
      include: {
        factSheet: true,
        pipelineRuns: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      res.status(404).json({ ok: false, error: "Project not found" });
      return;
    }

    res.json({ ok: true, data: project });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get project";
    res.status(500).json({ ok: false, error: message });
  }
});
