import { useCallback, useEffect, useState } from "react";
import { Show, SignInButton, UserButton, useAuth } from "@clerk/react";
import { Clapperboard, ArrowRight } from "lucide-react";

import { apiFetch } from "./lib/api";
import { CreatorProfileList } from "./components/CreatorProfileList";
import { CreatorProfileForm } from "./components/CreatorProfileForm";

interface ProfileSummary {
  id: string;
  name: string;
  dialect: string;
  tone: string;
  narratorRole: string;
  genre: string;
  scriptFormat: unknown;
  dialogueRules: unknown;
  narrativeFlow: unknown;
  qaRules: unknown;
  updatedAt: string;
}

type View = "list" | "create" | { edit: string };

function Dashboard() {
  const { getToken } = useAuth();
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<View>("list");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const data = await apiFetch<ProfileSummary[]>(
        "/api/creator-profiles",
        token,
      );
      setProfiles(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تحميل البروفايلات");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (data: Record<string, unknown>) => {
    try {
      setSaving(true);
      setError(null);
      const token = await getToken();

      if (typeof view === "object" && "edit" in view) {
        await apiFetch(`/api/creator-profiles/${view.edit}`, token, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      } else {
        await apiFetch("/api/creator-profiles", token, {
          method: "POST",
          body: JSON.stringify(data),
        });
      }

      await load();
      setView("list");
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      const token = await getToken();
      await apiFetch(`/api/creator-profiles/${id}`, token, {
        method: "DELETE",
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل الحذف");
    }
  };

  const editProfile =
    typeof view === "object" && "edit" in view
      ? profiles.find((p) => p.id === view.edit)
      : null;

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      {error && (
        <div className="bg-error/10 border border-error/30 text-error rounded-lg px-4 py-2.5 mb-6 text-sm">
          {error}
        </div>
      )}

      {view === "list" ? (
        <CreatorProfileList
          profiles={profiles}
          onEdit={(id) => setView({ edit: id })}
          onDelete={handleDelete}
          onCreate={() => setView("create")}
          loading={loading}
        />
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-1.5 text-sm text-sand-400 hover:text-sand-200 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            Back to list
          </button>

          <h2 className="text-xl font-bold text-sand-50">
            {editProfile ? `Edit: ${editProfile.name}` : "New Profile"}
          </h2>

          <CreatorProfileForm
            initial={
              editProfile
                ? {
                    name: editProfile.name,
                    dialect: editProfile.dialect,
                    tone: editProfile.tone,
                    narratorRole: editProfile.narratorRole,
                    genre: editProfile.genre,
                    scriptFormat: editProfile.scriptFormat as {
                      hasTimeRange: boolean;
                      blocks: {
                        label: string;
                        description: string;
                        required: boolean;
                      }[];
                    },
                    dialogueRules: editProfile.dialogueRules as {
                      speakerPolicy: string;
                      maxLinesPerBlock: number;
                      brevity: string;
                      extraRules: string[];
                    },
                    narrativeFlow: editProfile.narrativeFlow as {
                      beats: string[];
                      structures: string[];
                    },
                    qaRules: editProfile.qaRules as {
                      sourceOnly: boolean;
                      strictNameAccuracy: boolean;
                      checkBrevity: boolean;
                      checkFormat: boolean;
                      extraChecks: string[];
                    },
                  }
                : undefined
            }
            onSave={handleSave}
            onCancel={() => setView("list")}
            saving={saving}
          />
        </div>
      )}
    </div>
  );
}

export function App() {
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

      <main className="flex-1">
        <Show when="signed-out">
          <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-65px)]">
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
          </div>
        </Show>

        <Show when="signed-in">
          <Dashboard />
        </Show>
      </main>
    </div>
  );
}
