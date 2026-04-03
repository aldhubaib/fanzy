import express from "express";
import cors from "cors";
import { env } from "./lib/env.js";
import { clerkAuth, requireSignIn } from "./middleware/auth.js";
import { healthRouter } from "./routes/health.js";
import { researcherRouter } from "./routes/researcher.js";
import { creatorProfileRouter } from "./routes/creator-profiles.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkAuth);

app.use("/api", healthRouter);
app.use("/api", requireSignIn, researcherRouter);
app.use("/api", requireSignIn, creatorProfileRouter);

app.get("/", (_req, res) => {
  res.json({ name: "fanzy", version: "0.1.0" });
});

app.listen(env.PORT, () => {
  console.log(`Fanzy server running on port ${env.PORT}`);
});
