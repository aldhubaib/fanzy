import { Zap } from "lucide-react";
import type { ActivityEvent } from "./types";

const typeIcon: Record<ActivityEvent["type"], { icon: string; color: string }> = {
  success: { icon: "✓", color: "text-success" },
  warning: { icon: "⚠", color: "text-warning" },
  error: { icon: "✕", color: "text-error" },
  info: { icon: "●", color: "text-gray-500" },
  start: { icon: "▶", color: "text-info" },
};

interface ActivityFeedProps {
  events: ActivityEvent[];
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  if (events.length === 0) return null;

  return (
    <div className="bg-[#161616] border border-gray-800 rounded-[10px] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-50">
          <Zap className="w-3.5 h-3.5" />
          Live Activity
        </div>
        <span className="text-[11px] text-gray-600">{events.length} events</span>
      </div>
      <div className="max-h-[260px] overflow-y-auto">
        {events.map((event) => {
          const cfg = typeIcon[event.type];
          return (
            <div
              key={event.id}
              className="flex items-start gap-2.5 px-4 py-2 border-b border-white/[0.03] last:border-b-0 hover:bg-white/[0.02] transition-colors"
            >
              <span className={`text-[10px] w-3.5 text-center shrink-0 leading-[1.6] ${cfg.color}`}>
                {cfg.icon}
              </span>
              <span className="text-[10px] text-gray-600 whitespace-nowrap tabular-nums min-w-[52px]">
                {event.timestamp}
              </span>
              <span className="text-[11px] font-semibold text-gray-500 min-w-[72px]">
                {event.agent}
              </span>
              <span className="text-[11px] text-gray-600 flex-1">
                {event.message}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
