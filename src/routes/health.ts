import { type Router as RouterType, Router } from "express";
import { prisma } from "../lib/db.js";
import { redis } from "../lib/redis.js";

export const healthRouter: RouterType = Router();

healthRouter.get("/health", async (_req, res) => {
  const checks: Record<string, string> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  try {
    const pong = await redis.ping();
    checks.redis = pong === "PONG" ? "ok" : "error";
  } catch (err) {
    checks.redis = "error";
    console.error("Redis health check failed:", (err as Error).message);
  }

  const healthy = Object.values(checks).every((v) => v === "ok");

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "healthy" : "degraded",
    checks,
    timestamp: new Date().toISOString(),
  });
});
