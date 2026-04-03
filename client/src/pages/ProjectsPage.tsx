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
      setError(err instanceof Error ? err.message : "فشل تحميل المشاريع");
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
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-sand-50">المشاريع</h1>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-sand-950 font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          مشروع جديد
        </button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="w-16 h-16 text-sand-700 mx-auto mb-4" />
          <p className="text-sand-400 text-lg mb-2">لا توجد مشاريع بعد</p>
          <p className="text-sand-600 text-sm mb-6">
            ابدأ بإنشاء مشروعك الأول لتحويل قصتك إلى ستوريبورد
          </p>
          <button
            onClick={() => setShowNew(true)}
            className="bg-accent hover:bg-accent-dark text-sand-950 font-medium px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            إنشاء مشروع
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="block bg-sand-900/50 hover:bg-sand-900 border border-sand-800/50 rounded-xl p-5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-sand-100 mb-1">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-sand-500">
                    {project.genre && <span>{project.genre}</span>}
                    <span>
                      {new Date(project.createdAt).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                </div>
                <StatusBadge status={project.status} />
              </div>
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
