import express from "express";
import cors from "cors";
import { env } from "./lib/env.js";
import { clerkAuth, requireSignIn } from "./middleware/auth.js";
import { healthRouter } from "./routes/health.js";
import { projectsRouter } from "./routes/projects.js";
import { researcherRouter } from "./routes/researcher.js";
import { pipelineRouter } from "./routes/pipeline.js";
import { startWorkers } from "./pipeline/workers/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkAuth);

app.use("/api", healthRouter);
app.use("/api", requireSignIn, projectsRouter);
app.use("/api", requireSignIn, researcherRouter);
app.use("/api", requireSignIn, pipelineRouter);

app.get("/", (_req, res) => {
  res.json({ name: "fanzy", version: "0.1.0" });
});

app.listen(env.PORT, () => {
  startWorkers();
  console.log(`Fanzy server running on port ${env.PORT}`);
});
