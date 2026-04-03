import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { AgentNode } from "./types";

function StatusPill({ status }: { status: AgentNode["status"] }) {
  const styles: Record<string, string> = {
    done: "bg-success/10 text-success",
    running: "bg-gray-50/8 text-gray-50 animate-pulse",
    pending: "bg-gray-800 text-gray-600",
    revision: "bg-warning/10 text-warning",
    failed: "bg-error/10 text-error",
  };
  const labels: Record<string, string> = {
    done: "Done",
    running: "Running",
    pending: "Pending",
    revision: "Revising",
    failed: "Failed",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function formatDuration(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

interface AgentCardProps {
  agent: AgentNode;
  compact?: boolean;
  defaultExpanded?: boolean;
}

export function AgentCard({ agent, compact, defaultExpanded }: AgentCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);

  const hasContent = agent.output && agent.status === "done";
  const isActive = agent.status === "running";
  const borderExtra =
    agent.revisionNote
      ? "border-warning/20"
      : agent.status === "done" && !compact
        ? "border-gray-800"
        : "border-gray-800";

  return (
    <div
      onClick={() => hasContent && setExpanded((v) => !v)}
      className={`bg-[#161616] border rounded-[10px] transition-all ${borderExtra} ${
        hasContent ? "cursor-pointer hover:bg-[#1a1a1a] hover:border-gray-700" : ""
      } ${expanded ? "bg-[#1e1e1e] border-gray-700" : ""} ${
        isActive ? "ring-1 ring-gray-700" : ""
      }`}
      style={{ padding: compact ? "10px 12px" : "14px 16px" }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 bg-white/[0.04]">
          {agent.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-gray-50">{agent.name}</div>
          {agent.subtitle && (
            <div className="text-[11px] text-gray-600 mt-0.5">
              {agent.subtitle}
              {agent.durationMs != null && ` · ${formatDuration(agent.durationMs)}`}
            </div>
          )}
          {!agent.subtitle && agent.durationMs != null && (
            <div className="text-[11px] text-gray-600 mt-0.5">
              {formatDuration(agent.durationMs)}
            </div>
          )}
        </div>
        <StatusPill status={agent.status} />
        {hasContent && !compact && (
          <ChevronRight
            className={`w-4 h-4 text-gray-600 transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        )}
      </div>

      {isActive && (
        <div className="mt-2 h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full bg-gray-50 rounded-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: "60%" }} />
        </div>
      )}

      {expanded && hasContent && (
        <div className="mt-3 pt-3 border-t border-gray-800 space-y-3">
          {agent.output!.tags && agent.output!.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {agent.output!.tags.map((tag, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-gray-500">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {agent.output!.text && (
            <p className="text-[12px] text-gray-500 leading-relaxed">{agent.output!.text}</p>
          )}

          {agent.output!.arabicText && (
            <div dir="rtl" className="bg-white/[0.02] rounded-md px-3 py-2.5 text-[13px] text-gray-500 font-arabic leading-[1.8]">
              {agent.output!.arabicText}
            </div>
          )}

          {agent.output!.issues && agent.output!.issues.length > 0 && (
            <div className="space-y-1.5">
              {agent.output!.issues.map((issue, i) => (
                <div
                  key={i}
                  className={`px-2.5 py-2 rounded-md bg-white/[0.02] border-l-2 ${
                    issue.resolved ? "border-success" : "border-warning"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${
                      issue.resolved ? "text-success" : "text-warning"
                    }`}>
                      {issue.resolved ? "✓ Resolved" : issue.severity}
                    </span>
                    <span className="text-[10px] text-gray-600">→ {issue.targetAgent}</span>
                  </div>
                  <p className="text-[11px] text-gray-500">{issue.description}</p>
                </div>
              ))}
            </div>
          )}

          {agent.output!.scenes && agent.output!.scenes.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {agent.output!.scenes.map((scene) => (
                <div key={scene.number} className="bg-white/[0.02] border border-gray-800 rounded-lg p-3">
                  <div className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Scene {scene.number}
                  </div>
                  <div className="text-[12px] font-medium text-gray-50 mb-1">{scene.shotType}</div>
                  {scene.descriptionAr ? (
                    <p dir="rtl" className="text-[11px] text-gray-500 font-arabic leading-relaxed mb-1.5">
                      {scene.descriptionAr}
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-500 leading-relaxed mb-1.5">{scene.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {scene.tags.map((t, j) => (
                      <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-gray-600">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {agent.revisionNote && (
            <div className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded mt-1 ${
              agent.revisionNote.includes("Revised")
                ? "bg-success/10 text-success"
                : "bg-warning/10 text-warning"
            }`}>
              {agent.revisionNote}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
