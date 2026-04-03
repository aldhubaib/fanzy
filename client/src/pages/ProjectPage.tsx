import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { ArrowRight, Loader2, Play, AlertCircle } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { FactSheetView } from "@/components/FactSheetView";

interface PipelineRun {
  id: string;
  stage: string;
  status: string;
  error: string | null;
  createdAt: string;
}

interface ProjectDetail {
  id: string;
  title: string;
  sourceText: string;
  genre: string | null;
  dialect: string | null;
  status: string;
  createdAt: string;
  factSheet: {
    facts: unknown[];
    nameRegistry: unknown[];
    timeline: unknown[];
    locations: unknown[];
    lockedAt: string;
  } | null;
  pipelineRuns: PipelineRun[];
}

export function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [researching, setResearching] = useState(false);

  const loadProject = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const data = await apiFetch<ProjectDetail>(`/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تحميل المشروع");
    } finally {
      setLoading(false);
    }
  }, [id, getToken]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  async function triggerResearch() {
    try {
      setResearching(true);
      setError(null);
      const token = await getToken();
      await apiFetch(`/api/projects/${id}/research`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تشغيل الباحث");
    } finally {
      setResearching(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <p className="text-error">{error ?? "المشروع غير موجود"}</p>
        <Link to="/" className="text-accent hover:underline mt-4 inline-block">
          العودة للمشاريع
        </Link>
      </div>
    );
  }

  const canResearch = project.status === "DRAFT" || project.status === "FAILED";

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-sand-500 hover:text-sand-300 mb-6 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        المشاريع
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-sand-50 mb-2">
            {project.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-sand-500">
            {project.genre && <span>{project.genre}</span>}
            <span>
              {new Date(project.createdAt).toLocaleDateString("ar-SA")}
            </span>
            <StatusBadge status={project.status} />
          </div>
        </div>

        {canResearch && (
          <button
            onClick={triggerResearch}
            disabled={researching}
            className="flex items-center gap-2 bg-accent hover:bg-accent-dark disabled:bg-sand-700 disabled:cursor-not-allowed text-sand-950 font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {researching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري التحليل...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                تشغيل الباحث
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error rounded-lg p-4 mb-6 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-sand-900/30 border border-sand-800/50 rounded-xl p-5 mb-8">
        <h2 className="text-sm font-medium text-sand-400 mb-2">نص القصة</h2>
        <p className="text-sand-200 text-sm leading-relaxed whitespace-pre-wrap">
          {project.sourceText}
        </p>
      </div>

      {project.factSheet ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-sand-50">ورقة الحقائق</h2>
            <span className="text-xs text-sand-600">
              مقفلة منذ{" "}
              {new Date(project.factSheet.lockedAt).toLocaleDateString("ar-SA")}
            </span>
          </div>
          <FactSheetView data={project.factSheet as Parameters<typeof FactSheetView>[0]["data"]} />
        </div>
      ) : (
        !canResearch && (
          <div className="text-center py-12 text-sand-500">
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-accent" />
            <p>جاري تحليل القصة...</p>
          </div>
        )
      )}

      {project.pipelineRuns.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-sand-100 mb-3">
            سجل العمليات
          </h2>
          <div className="space-y-2">
            {project.pipelineRuns.map((run) => (
              <div
                key={run.id}
                className="bg-sand-900/50 rounded-lg p-3 flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sand-400 font-mono text-xs">
                    {run.stage}
                  </span>
                  <StatusBadge status={run.status} />
                </div>
                <span className="text-sand-600 text-xs">
                  {new Date(run.createdAt).toLocaleString("ar-SA")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
