import { researcherWorker } from "./researcher.js";
import { directorBriefWorker } from "./director-brief.js";
import {
  scriptwriterNarratorWorker,
  scriptwriterStorytellerWorker,
} from "./scriptwriter.js";
import { editorMergeWorker, editorFinalWorker } from "./editor.js";
import {
  directorCinematicWorker,
  directorNewsWorker,
} from "./director.js";
import { continuityWorker } from "./continuity.js";
import { qaLawyerWorker, qaViewerWorker } from "./qa.js";

const workers = [
  researcherWorker,
  directorBriefWorker,
  scriptwriterNarratorWorker,
  scriptwriterStorytellerWorker,
  editorMergeWorker,
  directorCinematicWorker,
  directorNewsWorker,
  continuityWorker,
  qaLawyerWorker,
  qaViewerWorker,
  editorFinalWorker,
];

export function startWorkers(): void {
  console.log(`Pipeline workers started: ${workers.length} agents ready`);
}

export async function stopWorkers(): Promise<void> {
  await Promise.all(workers.map((w) => w.close()));
  console.log("Pipeline workers stopped");
}
