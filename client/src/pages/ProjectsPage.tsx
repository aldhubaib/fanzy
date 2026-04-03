import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { Plus, FolderOpen, Loader2 } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { NewProjectDialog } from "@/components/NewProjectDialog";

interface ProjectSummary {
  id: string;
  title: string;
  status: string;
  genre: string | null;
  createdAt: string;
}

export function ProjectsPage() {
  const { getToken } = useAuth();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  async function loadProjects() {
    try {
      setLoading(true);
      const token = await getToken();
      const data = await apiFetch<ProjectSummary[]>("/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-sm font-semibold text-gray-50">Projects</h1>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 bg-gray-50 hover:bg-white text-gray-950 text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          New project
        </button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error rounded-md p-3 text-xs mb-4">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-1">No projects yet</p>
          <p className="text-gray-600 text-xs mb-5">
            Create your first project to turn a story into a storyboard
          </p>
          <button
            onClick={() => setShowNew(true)}
            className="bg-gray-50 hover:bg-white text-gray-950 text-xs font-medium px-4 py-1.5 rounded-md transition-colors cursor-pointer"
          >
            Create project
          </button>
        </div>
      ) : (
        <div className="space-y-px">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-900 rounded-md transition-colors group"
            >
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-gray-200 group-hover:text-gray-50 truncate">
                  {project.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-600">
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
                    })}
                  </span>
                </div>
              </div>
              <StatusBadge status={project.status} />
            </Link>
          ))}
        </div>
      )}

      {showNew && (
        <NewProjectDialog
          onClose={() => setShowNew(false)}
          onCreated={() => {
            setShowNew(false);
            loadProjects();
          }}
        />
      )}
    </div>
  );
}
