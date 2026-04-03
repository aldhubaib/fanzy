import type { PipelineData, PipelinePhase } from "./types";
import { AgentCard } from "./AgentCard";
import { ActivityFeed } from "./ActivityFeed";

function Connector() {
  return <div className="w-px h-5 bg-gray-800 mx-auto" />;
}

function SplitLines() {
  return (
    <div className="relative h-6 flex justify-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3 bg-gray-800" />
      <div className="absolute bottom-0 left-[25%] w-[calc(25%-4px)] h-3 border-t border-r border-gray-800 rounded-tr-lg" />
      <div className="absolute bottom-0 right-[25%] w-[calc(25%-4px)] h-3 border-t border-l border-gray-800 rounded-tl-lg" />
    </div>
  );
}

function MergeLines() {
  return (
    <div className="relative h-6 flex justify-center">
      <div className="absolute top-0 left-[25%] w-[calc(25%-4px)] h-3 border-b border-r border-gray-800 rounded-br-lg" />
      <div className="absolute top-0 right-[25%] w-[calc(25%-4px)] h-3 border-b border-l border-gray-800 rounded-bl-lg" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-3 bg-gray-800" />
    </div>
  );
}

function PhaseLabel({ text }: { text: string }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[1.2px] text-gray-600 mb-2 pl-1">
      {text}
    </div>
  );
}

function StatusCounters({ stats }: { stats: PipelineData["stats"] }) {
  return (
    <div className="grid grid-cols-4 gap-2 mt-8">
      <CounterCard label="Done" value={stats.done} color="text-success" dotColor="bg-success" />
      <CounterCard label="Revised" value={stats.revised} color="text-warning" dotColor="bg-warning" />
      <CounterCard label="Rounds" value={stats.rounds} color="text-gray-500" dotColor="bg-gray-500" />
      <CounterCard
        label="Time"
        value={`${Math.round(stats.totalTimeMs / 1000)}s`}
        color="text-gray-500"
        dotColor="bg-gray-600"
      />
    </div>
  );
}

function CounterCard({
  label,
  value,
  color,
  dotColor,
}: {
  label: string;
  value: number | string;
  color: string;
  dotColor: string;
}) {
  return (
    <div className="bg-[#161616] border border-gray-800 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600 mb-1">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        {label}
      </div>
      <div className={`text-xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}

function renderPhase(phase: PipelinePhase, isFirst: boolean) {
  if (phase.type === "single") {
    const agent = phase.agents[0];
    return (
      <div key={phase.id}>
        {!isFirst && <Connector />}
        {phase.label && <PhaseLabel text={phase.label} />}
        <AgentCard agent={agent} />
        {phase.approvalText && (
          <>
            <Connector />
            <div className="text-center py-1 text-[11px] font-medium text-success">
              {phase.approvalText}
            </div>
          </>
        )}
      </div>
    );
  }

  const [agentA, agentB] = phase.agents;
  return (
    <div key={phase.id}>
      {!isFirst && <Connector />}
      {phase.label && <PhaseLabel text={phase.label} />}
      <SplitLines />
      <div className="grid grid-cols-2 gap-2">
        <AgentCard agent={agentA} compact />
        <AgentCard agent={agentB} compact />
      </div>
      {phase.mergeAgent && (
        <>
          <MergeLines />
          <AgentCard agent={phase.mergeAgent} />
        </>
      )}
      {phase.approvalText && (
        <>
          <Connector />
          <div className="text-center py-1 text-[11px] font-medium text-success">
            {phase.approvalText}
          </div>
        </>
      )}
    </div>
  );
}

interface PipelineViewProps {
  data: PipelineData;
}

export function PipelineView({ data }: PipelineViewProps) {
  return (
    <div className="space-y-0">
      {data.phases.map((phase, i) => renderPhase(phase, i === 0))}
      <StatusCounters stats={data.stats} />
      <div className="mt-5">
        <ActivityFeed events={data.activity} />
      </div>
    </div>
  );
}
