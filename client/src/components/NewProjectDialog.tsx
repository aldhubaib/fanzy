import { useState } from "react";
import { useAuth } from "@clerk/react";
import { X, Loader2 } from "lucide-react";

import { apiFetch } from "@/lib/api";

interface NewProjectDialogProps {
  onClose: () => void;
  onCreated: () => void;
}

export function NewProjectDialog({ onClose, onCreated }: NewProjectDialogProps) {
  const { getToken } = useAuth();
  const [title, setTitle] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [genre, setGenre] = useState("");
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
        body: JSON.stringify({
          title,
          sourceText,
          genre: genre || undefined,
        }),
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إنشاء المشروع");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-sand-900 border border-sand-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-sand-800">
          <h2 className="text-xl font-bold text-sand-50">مشروع جديد</h2>
          <button
            onClick={onClose}
            className="text-sand-500 hover:text-sand-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-sand-300 mb-1.5">
              عنوان المشروع
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: قصة الصياد والبحر"
              required
              className="w-full bg-sand-950 border border-sand-700 rounded-lg px-4 py-2.5 text-sand-100 placeholder:text-sand-600 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sand-300 mb-1.5">
              النوع
            </label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="مثال: دراما عائلية، كوميدي، وثائقي"
              className="w-full bg-sand-950 border border-sand-700 rounded-lg px-4 py-2.5 text-sand-100 placeholder:text-sand-600 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sand-300 mb-1.5">
              نص القصة
            </label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="اكتب أو الصق نص القصة هنا..."
              required
              rows={8}
              className="w-full bg-sand-950 border border-sand-700 rounded-lg px-4 py-2.5 text-sand-100 placeholder:text-sand-600 focus:outline-none focus:border-accent transition-colors resize-none leading-relaxed"
            />
            <p className="text-xs text-sand-600 mt-1">
              50 حرفاً على الأقل
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || !title || sourceText.length < 50}
            className="w-full bg-accent hover:bg-accent-dark disabled:bg-sand-700 disabled:cursor-not-allowed text-sand-950 font-semibold py-3 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              "إنشاء المشروع"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
