import { useState } from "react";
import { useAuth } from "@clerk/react";
import { X, Loader2 } from "lucide-react";

import { apiFetch } from "@/lib/api";

interface NewProjectDialogProps {
  onClose: () => void;
  onCreated: () => void;
}

export function NewProjectDialog({
  onClose,
  onCreated,
}: NewProjectDialogProps) {
  const { getToken } = useAuth();
  const [title, setTitle] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const token = await getToken();
      await apiFetch("/api/projects", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, sourceText }),
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-50">New Project</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error rounded-md p-3 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Fisherman and the Sea"
              required
              className="w-full bg-gray-950 border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-gray-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Story text
            </label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste or write your story here..."
              required
              rows={8}
              dir="rtl"
              className="w-full bg-gray-950 border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-100 font-arabic placeholder:text-gray-600 placeholder:font-sans focus:outline-none focus:border-gray-600 transition-colors resize-none leading-relaxed"
            />
            <p className="text-[11px] text-gray-600 mt-1">
              Minimum 50 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || !title || sourceText.length < 50}
            className="w-full bg-gray-50 hover:bg-white disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-gray-950 text-sm font-medium py-2 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create project"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
