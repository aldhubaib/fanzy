import { UserPen, Pencil, Trash2, Plus } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  dialect: string;
  tone: string;
  narratorRole: string;
  genre: string;
  updatedAt: string;
}

const DIALECT_LABELS: Record<string, string> = {
  kuwaiti: "Kuwaiti",
  gulf: "Gulf",
  egyptian: "Egyptian",
  levantine: "Levantine",
  moroccan: "Moroccan",
  msa: "MSA (Formal)",
};

const GENRE_LABELS: Record<string, string> = {
  true_crime: "True Crime",
  mystery: "Mystery",
  documentary: "Documentary",
  drama: "Drama",
  comedy: "Comedy",
  historical: "Historical",
  social: "Social",
};

const NARRATOR_LABELS: Record<string, string> = {
  in_shot: "In-Shot",
  voice_over: "Voice Over",
  none: "None",
};

interface Props {
  profiles: Profile[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  loading?: boolean;
}

export function CreatorProfileList({
  profiles,
  onEdit,
  onDelete,
  onCreate,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="ltr">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-sand-50">Creator Profiles</h2>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-sand-950 font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Profile
        </button>
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <UserPen className="w-12 h-12 text-sand-600 mx-auto" />
          <p className="text-sand-400">No profiles yet</p>
          <p className="text-sand-500 text-sm">
            Create a profile to define a creator's style — dialect, format, dialogue rules
          </p>
          <button
            onClick={onCreate}
            className="bg-accent hover:bg-accent-dark text-sand-950 font-medium px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            Create First Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="bg-sand-900/50 border border-sand-800 rounded-xl p-4 space-y-3 hover:border-sand-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-base font-semibold text-sand-100">
                  {p.name}
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(p.id)}
                    className="text-sand-500 hover:text-accent p-1.5 rounded-md hover:bg-sand-800 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="text-sand-500 hover:text-error p-1.5 rounded-md hover:bg-sand-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="bg-sand-800 text-sand-300 text-xs px-2 py-0.5 rounded-md">
                  {DIALECT_LABELS[p.dialect] ?? p.dialect}
                </span>
                <span className="bg-sand-800 text-sand-300 text-xs px-2 py-0.5 rounded-md">
                  {GENRE_LABELS[p.genre] ?? p.genre}
                </span>
                <span className="bg-sand-800 text-sand-300 text-xs px-2 py-0.5 rounded-md">
                  {NARRATOR_LABELS[p.narratorRole] ?? p.narratorRole}
                </span>
              </div>

              <p className="text-sm text-sand-400">{p.tone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
