import { useState } from "react";
import { Save, X } from "lucide-react";

const DIALECTS = [
  { value: "kuwaiti", label: "Kuwaiti" },
  { value: "gulf", label: "Gulf" },
  { value: "egyptian", label: "Egyptian" },
  { value: "levantine", label: "Levantine" },
  { value: "moroccan", label: "Moroccan" },
  { value: "msa", label: "MSA (Formal)" },
];

const GENRES = [
  { value: "true_crime", label: "True Crime" },
  { value: "mystery", label: "Mystery" },
  { value: "documentary", label: "Documentary" },
  { value: "drama", label: "Drama" },
  { value: "comedy", label: "Comedy" },
  { value: "historical", label: "Historical" },
  { value: "social", label: "Social" },
];

const TONES = [
  { value: "dark_cinematic", label: "Dark & Cinematic" },
  { value: "suspenseful", label: "Suspenseful" },
  { value: "journalistic", label: "Journalistic" },
  { value: "emotional", label: "Emotional" },
  { value: "comedic", label: "Comedic" },
  { value: "neutral", label: "Neutral" },
];

const NARRATOR_ROLES = [
  {
    value: "in_shot",
    label: "In-Shot Narrator",
    desc: "Appears on camera, reacts, guides the viewer. Only narrator speaks. Short lines.",
  },
  {
    value: "voice_over",
    label: "Voice Over",
    desc: "Off-camera narration. Can be longer. May quote sources.",
  },
  {
    value: "none",
    label: "No Narrator",
    desc: "Scene descriptions and dialogue only. Characters may speak.",
  },
];

const STRUCTURES = [
  {
    value: "linear",
    label: "Linear",
    desc: "Story moves forward only. No flashbacks. Best for true crime and mystery.",
  },
  {
    value: "nonlinear",
    label: "Non-linear",
    desc: "Jumps in time are allowed. Flashbacks, flash-forwards, parallel timelines.",
  },
  {
    value: "end_first",
    label: "End First",
    desc: "Reveal the ending upfront, then rewind to show how it happened.",
  },
];

const BREVITY_OPTIONS = [
  { value: "minimal", label: "Minimal — 2-3 lines, one point per line" },
  { value: "concise", label: "Concise — 3-5 lines, tight and punchy" },
  { value: "standard", label: "Standard — 5-8 lines, room to breathe" },
  { value: "unrestricted", label: "Unrestricted — no line limit" },
];

export interface ProfileFormData {
  name: string;
  dialect: string;
  tone: string;
  narratorRole: string;
  genre: string;
  scriptFormat: {
    hasTimeRange: boolean;
    blocks: { label: string; description: string; required: boolean }[];
  };
  dialogueRules: {
    speakerPolicy: string;
    maxLinesPerBlock: number;
    brevity: string;
    extraRules: string[];
  };
  narrativeFlow: {
    beats: string[];
    structures: string[];
  };
  qaRules: {
    sourceOnly: boolean;
    strictNameAccuracy: boolean;
    checkBrevity: boolean;
    checkFormat: boolean;
    extraChecks: string[];
  };
}

interface Props {
  initial?: ProfileFormData;
  onSave: (data: ProfileFormData) => void;
  onCancel: () => void;
  saving?: boolean;
}

const NARRATOR_DEFAULTS: Record<
  string,
  { speakerPolicy: string; maxLinesPerBlock: number; brevity: string }
> = {
  in_shot: { speakerPolicy: "narrator_only", maxLinesPerBlock: 5, brevity: "concise" },
  voice_over: { speakerPolicy: "narrator_and_sources", maxLinesPerBlock: 8, brevity: "standard" },
  none: { speakerPolicy: "all", maxLinesPerBlock: 15, brevity: "unrestricted" },
};

const GENRE_BEATS: Record<string, string[]> = {
  true_crime: ["hook", "motive", "crime", "cover_up", "discovery", "clues", "exposure", "punishment", "reflection"],
  mystery: ["hook", "mystery", "investigation", "clues", "red_herring", "reveal", "resolution"],
  documentary: ["hook", "context", "story", "evidence", "perspectives", "conclusion"],
  drama: ["hook", "setup", "conflict", "escalation", "climax", "resolution"],
  comedy: ["hook", "setup", "escalation", "punchline", "callback"],
  historical: ["hook", "context", "events", "key_figures", "turning_point", "aftermath", "legacy"],
  social: ["hook", "issue", "stories", "evidence", "perspectives", "reflection"],
};

function buildDefaults(genre: string, narratorRole: string): ProfileFormData {
  const nd = NARRATOR_DEFAULTS[narratorRole] ?? NARRATOR_DEFAULTS.in_shot;
  return {
    name: "",
    dialect: "kuwaiti",
    tone: "dark_cinematic",
    narratorRole,
    genre,
    scriptFormat: {
      hasTimeRange: narratorRole === "in_shot",
      blocks: narratorRole === "in_shot"
        ? [
            { label: "الشوت", description: "Visual scene description", required: true },
            { label: "مكان الراوي", description: "Where the narrator is in the shot", required: true },
            { label: "الراوي يقول:", description: "Narrator spoken lines", required: true },
          ]
        : narratorRole === "voice_over"
          ? [
              { label: "المشهد", description: "Visual scene description", required: true },
              { label: "التعليق", description: "Narration text", required: true },
            ]
          : [
              { label: "المشهد", description: "Visual scene description", required: true },
            ],
    },
    dialogueRules: { ...nd, extraRules: [] },
    narrativeFlow: {
      beats: GENRE_BEATS[genre] ?? GENRE_BEATS.true_crime,
      structures: ["linear", "nonlinear", "end_first"],
    },
    qaRules: {
      sourceOnly: true,
      strictNameAccuracy: true,
      checkBrevity: narratorRole === "in_shot",
      checkFormat: true,
      extraChecks: [],
    },
  };
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-sand-300">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-sand-900 border border-sand-700 rounded-lg px-3 py-2 text-sand-100 text-sm focus:outline-none focus:border-accent transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-sand-200 border-b border-sand-800 pb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function CreatorProfileForm({
  initial,
  onSave,
  onCancel,
  saving,
}: Props) {
  const [data, setData] = useState<ProfileFormData>(
    initial ?? buildDefaults("true_crime", "in_shot"),
  );

  const update = <K extends keyof ProfileFormData>(
    key: K,
    value: ProfileFormData[K],
  ) => setData((d) => ({ ...d, [key]: value }));

  const updateNested = <
    K extends keyof ProfileFormData,
    SK extends keyof ProfileFormData[K],
  >(
    key: K,
    subKey: SK,
    value: ProfileFormData[K][SK],
  ) =>
    setData((d) => ({
      ...d,
      [key]: { ...d[key], [subKey]: value },
    }));

  const handleNarratorChange = (role: string) => {
    const nd = NARRATOR_DEFAULTS[role] ?? NARRATOR_DEFAULTS.in_shot;
    const defaults = buildDefaults(data.genre, role);
    setData((d) => ({
      ...d,
      narratorRole: role,
      scriptFormat: defaults.scriptFormat,
      dialogueRules: { ...nd, extraRules: d.dialogueRules.extraRules },
      qaRules: { ...d.qaRules, checkBrevity: role === "in_shot" },
    }));
  };

  const handleGenreChange = (genre: string) => {
    setData((d) => ({
      ...d,
      genre,
      narrativeFlow: {
        ...d.narrativeFlow,
        beats: GENRE_BEATS[genre] ?? GENRE_BEATS.true_crime,
      },
    }));
  };

  const valid = data.name.trim() && data.narratorRole;

  const STRICT_GENRES = ["true_crime", "mystery", "documentary", "historical"];

  const GENRE_TONE: Record<string, string> = {
    true_crime: "dark_cinematic",
    mystery: "suspenseful",
    documentary: "journalistic",
    drama: "emotional",
    comedy: "comedic",
    historical: "journalistic",
    social: "neutral",
  };

  const buildSubmitData = () => ({
    ...data,
    tone: GENRE_TONE[data.genre] ?? "neutral",
    qaRules: {
      sourceOnly: STRICT_GENRES.includes(data.genre),
      strictNameAccuracy: true,
      checkBrevity: data.narratorRole === "in_shot",
      checkFormat: true,
      extraChecks: [],
    },
  });

  return (
    <form
      dir="ltr"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSave(buildSubmitData());
      }}
      className="space-y-8"
    >
      {/* Basic Info */}
      <Section title="Basic Info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-sand-300">
              Profile Name
            </span>
            <input
              type="text"
              value={data.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. e3wais"
              className="w-full bg-sand-900 border border-sand-700 rounded-lg px-3 py-2 text-sand-100 text-sm placeholder:text-sand-600 focus:outline-none focus:border-accent transition-colors"
            />
          </label>
          <Select
            label="Dialect"
            value={data.dialect}
            onChange={(v) => update("dialect", v)}
            options={DIALECTS}
          />
          <Select
            label="Genre"
            value={data.genre}
            onChange={handleGenreChange}
            options={GENRES}
          />
        </div>
      </Section>

      {/* Narrator */}
      <Section title="Narrator">
        <div className="grid grid-cols-1 gap-3">
          {NARRATOR_ROLES.map((nr) => (
            <label
              key={nr.value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                data.narratorRole === nr.value
                  ? "border-accent bg-accent/5"
                  : "border-sand-800 hover:border-sand-700"
              }`}
            >
              <input
                type="radio"
                name="narratorRole"
                value={nr.value}
                checked={data.narratorRole === nr.value}
                onChange={() => handleNarratorChange(nr.value)}
                className="mt-0.5 accent-accent"
              />
              <div>
                <div className="text-sm font-medium text-sand-100">
                  {nr.label}
                </div>
                <div className="text-xs text-sand-400 mt-0.5">{nr.desc}</div>
              </div>
            </label>
          ))}
        </div>

        {data.narratorRole === "in_shot" && (
          <div className="mt-4">
            <Select
              label="Dialogue Length"
              value={data.dialogueRules.brevity}
              onChange={(v) => {
                const maxLines = v === "minimal" ? 3 : v === "concise" ? 5 : v === "standard" ? 8 : 15;
                setData((d) => ({
                  ...d,
                  dialogueRules: { ...d.dialogueRules, brevity: v, maxLinesPerBlock: maxLines },
                }));
              }}
              options={BREVITY_OPTIONS}
            />
          </div>
        )}
      </Section>

      {/* Story Structure */}
      <Section title="Story Structure">
        <div className="bg-sand-900/50 border border-sand-800 rounded-lg p-4 space-y-3">
          <p className="text-sm text-sand-300">
            The pipeline will produce <span className="text-accent font-medium">3 final versions</span> of every script:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STRUCTURES.map((s) => (
              <div
                key={s.value}
                className="border border-sand-700 rounded-lg p-3"
              >
                <div className="text-sm font-medium text-sand-100">
                  {s.label}
                </div>
                <div className="text-xs text-sand-400 mt-1">{s.desc}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-sand-500">
            The creator picks their favorite after all 3 are generated.
          </p>
        </div>
      </Section>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-sand-800">
        <button
          type="submit"
          disabled={!valid || saving}
          className="flex items-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed text-sand-950 font-medium px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 bg-sand-800 hover:bg-sand-700 text-sand-300 px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}
