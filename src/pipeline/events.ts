import { EventEmitter } from "node:events";
import type { PipelineEvent } from "../types/pipeline.js";

class PipelineEventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  emit(event: "pipeline", data: PipelineEvent): boolean {
    return this.emitter.emit(event, data);
  }

  on(event: "pipeline", listener: (data: PipelineEvent) => void): this {
    this.emitter.on(event, listener);
    return this;
  }

  removeListener(
    event: "pipeline",
    listener: (data: PipelineEvent) => void,
  ): this {
    this.emitter.removeListener(event, listener);
    return this;
  }
}

export const pipelineEvents = new PipelineEventBus();
