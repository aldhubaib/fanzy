import { type Router as RouterType, Router } from "express";
import { getAuth } from "@clerk/express";
import { z } from "zod";

import { prisma } from "../lib/db.js";
import {
  createProfileInputSchema,
  updateProfileInputSchema,
} from "../types/creator-profile.js";

export const creatorProfileRouter: RouterType = Router();

const paramsSchema = z.object({
  id: z.string().min(1),
});

/** POST /api/creator-profiles — create a new profile */
creatorProfileRouter.post("/creator-profiles", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      res.status(404).json({ ok: false, error: "User not found" });
      return;
    }

    const input = createProfileInputSchema.parse(req.body);

    const profile = await prisma.creatorProfile.create({
      data: {
        name: input.name,
        dialect: input.dialect,
        tone: input.tone,
        narratorRole: input.narratorRole,
        genre: input.genre,
        scriptFormat: input.scriptFormat,
        dialogueRules: input.dialogueRules,
        narrativeFlow: input.narrativeFlow,
        qaRules: input.qaRules,
        userId: user.id,
      },
    });

    res.status(201).json({ ok: true, data: profile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ ok: false, error: error.errors });
      return;
    }
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ ok: false, error: message });
  }
});

/** GET /api/creator-profiles — list all profiles for the current user */
creatorProfileRouter.get("/creator-profiles", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      res.status(404).json({ ok: false, error: "User not found" });
      return;
    }

    const profiles = await prisma.creatorProfile.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    res.json({ ok: true, data: profiles });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ ok: false, error: message });
  }
});

/** GET /api/creator-profiles/:id — get a single profile */
creatorProfileRouter.get("/creator-profiles/:id", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    const { id } = paramsSchema.parse(req.params);

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      res.status(404).json({ ok: false, error: "User not found" });
      return;
    }

    const profile = await prisma.creatorProfile.findFirst({
      where: { id, userId: user.id },
    });

    if (!profile) {
      res.status(404).json({ ok: false, error: "Profile not found" });
      return;
    }

    res.json({ ok: true, data: profile });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ ok: false, error: message });
  }
});

/** PATCH /api/creator-profiles/:id — update a profile */
creatorProfileRouter.patch("/creator-profiles/:id", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    const { id } = paramsSchema.parse(req.params);
    const input = updateProfileInputSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      res.status(404).json({ ok: false, error: "User not found" });
      return;
    }

    const existing = await prisma.creatorProfile.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      res.status(404).json({ ok: false, error: "Profile not found" });
      return;
    }

    const profile = await prisma.creatorProfile.update({
      where: { id },
      data: input,
    });

    res.json({ ok: true, data: profile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ ok: false, error: error.errors });
      return;
    }
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ ok: false, error: message });
  }
});

/** DELETE /api/creator-profiles/:id — delete a profile */
creatorProfileRouter.delete("/creator-profiles/:id", async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    const { id } = paramsSchema.parse(req.params);

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      res.status(404).json({ ok: false, error: "User not found" });
      return;
    }

    const existing = await prisma.creatorProfile.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      res.status(404).json({ ok: false, error: "Profile not found" });
      return;
    }

    await prisma.creatorProfile.delete({ where: { id } });

    res.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ ok: false, error: message });
  }
});
