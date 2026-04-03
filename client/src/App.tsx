import { useEffect, useState } from "react";
import { Show, SignInButton, UserButton } from "@clerk/react";
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
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-sand-800/50">
        <div className="flex items-center gap-2">
          <Clapperboard className="w-6 h-6 text-accent" />
          <span className="text-lg font-semibold text-sand-50">Fanzy</span>
        </div>

        <Show when="signed-in">
          <UserButton />
        </Show>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="bg-accent hover:bg-accent-dark text-sand-950 font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer">
              تسجيل الدخول
            </button>
          </SignInButton>
        </Show>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <Show when="signed-out">
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
            <SignInButton mode="modal">
              <button className="bg-accent hover:bg-accent-dark text-sand-950 font-semibold px-8 py-3 rounded-xl text-lg transition-colors cursor-pointer">
                ابدأ الآن
              </button>
            </SignInButton>
          </div>
        </Show>

        <Show when="signed-in">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-sand-50">
              مرحباً بك في Fanzy
            </h2>
            <p className="text-sand-400 max-w-md mx-auto">
              لوحة التحكم قادمة قريباً — الآن أنت مسجل بنجاح
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
                  <div
                    key={key}
                    className="flex justify-between gap-6 text-xs"
                  >
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
        </Show>
      </main>
    </div>
  );
}
