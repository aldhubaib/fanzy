import { Queue, type ConnectionOptions } from "bullmq";
import type { AgentRole } from "../types/pipeline.js";

const connection: ConnectionOptions = {
  url: process.env.REDIS_URL,
};

function createQueue(role: AgentRole): Queue {
  return new Queue(`pipeline-${role.toLowerCase()}`, {
    connection,
    defaultJobOptions: {
      attempts: 1,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    },
  });
}

export const queues: Record<AgentRole, Queue> = {
  RESEARCHER: createQueue("RESEARCHER"),
  DIRECTOR_BRIEF: createQueue("DIRECTOR_BRIEF"),
  SCRIPTWRITER_NARRATOR: createQueue("SCRIPTWRITER_NARRATOR"),
  SCRIPTWRITER_STORYTELLER: createQueue("SCRIPTWRITER_STORYTELLER"),
  EDITOR_MERGE: createQueue("EDITOR_MERGE"),
  DIRECTOR_CINEMATIC: createQueue("DIRECTOR_CINEMATIC"),
  DIRECTOR_NEWS: createQueue("DIRECTOR_NEWS"),
  CONTINUITY_CHECKER: createQueue("CONTINUITY_CHECKER"),
  QA_LAWYER: createQueue("QA_LAWYER"),
  QA_VIEWER: createQueue("QA_VIEWER"),
  EDITOR_FINAL: createQueue("EDITOR_FINAL"),
};

export { connection };
