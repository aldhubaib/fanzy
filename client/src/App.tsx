import { useEffect, useState } from "react";
import { Clapperboard } from "lucide-react";

interface HealthStatus {
  status: string;
  checks: Record<string, string>;
  timestamp: string;
}

export function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <Clapperboard className="w-10 h-10 text-accent" />
          <h1 className="text-4xl font-bold tracking-tight text-sand-50">
            Fanzy
          </h1>
        </div>

        <p className="text-sand-400 text-lg max-w-md mx-auto">
          نظام الستوريبورد الذكي لإنتاج الفيديو العربي
        </p>

        {health && (
          <div className="mt-8 bg-sand-900/50 rounded-xl p-4 text-sm font-mono text-sand-300 inline-block">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`w-2 h-2 rounded-full ${health.status === "healthy" ? "bg-success" : "bg-error"}`}
              />
              <span>{health.status}</span>
            </div>
            {Object.entries(health.checks).map(([key, val]) => (
              <div key={key} className="flex justify-between gap-6 text-xs">
                <span className="text-sand-500">{key}</span>
                <span
                  className={val === "ok" ? "text-success" : "text-error"}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
