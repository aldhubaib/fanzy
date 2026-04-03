import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { ArrowLeft, Loader2, Play, AlertCircle } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { FactSheetView } from "@/components/FactSheetView";
import { PipelineView } from "@/components/pipeline/PipelineView";
import { DEMO_PIPELINE } from "@/components/pipeline/demo-data";

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
      setError(err instanceof Error ? err.message : "Failed to load project");
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
      setError(err instanceof Error ? err.message : "Researcher failed");
    } finally {
      setResearching(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8 text-center">
        <p className="text-error text-sm">{error ?? "Project not found"}</p>
        <Link
          to="/"
          className="text-gray-400 hover:text-gray-200 text-xs mt-4 inline-block"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  const canResearch =
    project.status === "DRAFT" || project.status === "FAILED";

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Projects
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-50 mb-1">
            {project.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            {project.genre && (
              <>
                <span>{project.genre}</span>
                <span>·</span>
              </>
            )}
            <span>
              {new Date(project.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span>·</span>
            <StatusBadge status={project.status} />
          </div>
        </div>

        {canResearch && (
          <button
            onClick={triggerResearch}
            disabled={researching}
            className="flex items-center gap-1.5 bg-gray-50 hover:bg-white disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-gray-950 text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
          >
            {researching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Run Researcher
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error rounded-md p-3 text-xs mb-6 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <details className="mb-8 group">
        <summary className="text-xs font-medium text-gray-500 cursor-pointer hover:text-gray-300 transition-colors select-none">
          Source text
        </summary>
        <div className="mt-3 bg-gray-900 border border-gray-800/50 rounded-md p-4">
          <p
            dir="rtl"
            className="text-sm text-gray-300 font-arabic leading-relaxed whitespace-pre-wrap"
          >
            {project.sourceText}
          </p>
        </div>
      </details>

      {project.factSheet ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-50">Fact Sheet</h2>
            <span className="text-[11px] text-gray-600">
              Locked{" "}
              {new Date(project.factSheet.lockedAt).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" },
              )}
            </span>
          </div>
          <FactSheetView
            data={
              project.factSheet as Parameters<typeof FactSheetView>[0]["data"]
            }
          />
        </div>
      ) : (
        canResearch && (
          <div className="text-center py-16 text-gray-600 text-xs">
            Run the Researcher to generate a Fact Sheet from the source text.
          </div>
        )
      )}

      {!canResearch && !project.factSheet && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xs font-medium text-gray-500 mb-4">Pipeline</h2>
        <PipelineView data={DEMO_PIPELINE} />
      </div>
    </div>
  );
}
