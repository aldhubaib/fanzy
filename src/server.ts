import express from "express";
import cors from "cors";
import { env } from "./lib/env.js";
import { healthRouter } from "./routes/health.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", healthRouter);

app.get("/", (_req, res) => {
  res.json({ name: "fanzy", version: "0.1.0" });
});

app.listen(env.PORT, () => {
  console.log(`Fanzy server running on port ${env.PORT}`);
});
