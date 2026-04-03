import type { PipelineData } from "./types";

export const DEMO_PIPELINE: PipelineData = {
  status: "complete",
  stats: { done: 11, revised: 1, rounds: 1, totalTimeMs: 86200 },
  phases: [
    {
      id: "research",
      type: "single",
      agents: [
        {
          id: "researcher",
          role: "researcher",
          name: "Researcher",
          icon: "🔍",
          subtitle: "Fact Sheet",
          status: "done",
          durationMs: 8200,
          output: {
            tags: ["14 facts", "3 characters", "5 locations", "3-week timeline"],
            arabicText: "محمد الغامدي • عائشة • خالد",
          },
        },
      ],
    },
    {
      id: "brief",
      type: "single",
      agents: [
        {
          id: "director-brief",
          role: "brief",
          name: "Director Brief",
          icon: "🎬",
          subtitle: "Visual Direction",
          status: "done",
          durationMs: 5800,
          output: {
            text: "Cinematic documentary — warm tones, natural light, intimate framing. Slow pacing to match the ritual of coffee preparation.",
            tags: ["Establishing wides", "Extreme close-ups", "Over-shoulder", "Slow pans"],
          },
        },
      ],
    },
    {
      id: "script",
      label: "Script · Best of 2",
      type: "parallel",
      agents: [
        {
          id: "scriptwriter-a",
          role: "scriptwriter-a",
          name: "Narrator",
          icon: "✍️",
          status: "done",
          durationMs: 12100,
          output: {
            tags: ["3 acts", "12 beats", "9:40"],
            arabicText:
              "في أعالي جبال الطائف، حيث يلتقي الضباب بأشجار الورد، تبدأ قصة القهوة العربية...",
          },
        },
        {
          id: "scriptwriter-b",
          role: "scriptwriter-b",
          name: "Storyteller",
          icon: "✨",
          status: "done",
          durationMs: 11400,
          output: {
            tags: ["3 acts", "14 beats", "10:05"],
            arabicText:
              "محمد الغامدي لا يتذكر أول فنجان قهوة شربه. يقول إن القهوة كانت دائمًا هناك...",
          },
        },
      ],
      mergeAgent: {
        id: "editor-merge",
        role: "editor-merge",
        name: "Editor",
        icon: "✎",
        subtitle: "Merge + Polish",
        status: "done",
        durationMs: 10300,
        output: {
          text: "Storyteller's emotional opening + Narrator's structured acts. Merged to 13 beats, 9:52 duration.",
          tags: ["3 acts", "13 beats", "9:52", "18 fact refs"],
        },
      },
    },
    {
      id: "direction",
      label: "Direction · Best of 2",
      type: "parallel",
      agents: [
        {
          id: "director-a",
          role: "director-a",
          name: "Cinematic Eye",
          icon: "🎥",
          status: "done",
          durationMs: 15200,
          revisionNote: "✓ Revised in Round 1 — added establishing shot",
          output: {
            tags: ["18 scenes", "Drone opens", "Handheld craft"],
          },
        },
        {
          id: "director-b",
          role: "director-b",
          name: "News Eye",
          icon: "📰",
          status: "done",
          durationMs: 13800,
          output: {
            tags: ["16 scenes", "Tripod coverage", "Interview setups"],
          },
        },
      ],
      mergeAgent: {
        id: "continuity",
        role: "continuity",
        name: "Continuity Checker",
        icon: "🔗",
        subtitle: "Merge + Validate",
        status: "done",
        durationMs: 9600,
        output: {
          tags: ["20 scenes", "All locations established", "No continuity gaps"],
          scenes: [
            {
              number: 1,
              shotType: "Establishing Wide",
              description: "Taif hills at sunrise, mist over coffee terraces",
              tags: ["Drone", "B-roll: mist"],
            },
            {
              number: 2,
              shotType: "Medium Shot",
              description: "",
              descriptionAr: "محمد يجهّز القهوة العربية",
              tags: ["Static", "Natural light"],
            },
            {
              number: 3,
              shotType: "Extreme Close-up",
              description: "Coffee beans roasting in traditional pan",
              tags: ["Macro", "Slow motion"],
            },
            {
              number: 4,
              shotType: "Over Shoulder",
              description: "",
              descriptionAr: "عائشة تراقب محمد وهو يحمّص",
              tags: ["Handheld", "Shallow DOF"],
            },
          ],
        },
      },
    },
    {
      id: "qa",
      label: "Quality Assurance · Round 1 of 1",
      type: "parallel",
      agents: [
        {
          id: "qa-lawyer",
          role: "qa-lawyer",
          name: "The Lawyer",
          icon: "⚖️",
          subtitle: "Accuracy",
          status: "done",
          durationMs: 8400,
          output: {
            issues: [
              {
                targetAgent: "Cinematic Eye",
                issueType: "missing_reference",
                severity: "critical",
                description:
                  "Scene 7: Coffee farm has no establishing shot — crew won't know the setting. Fixed in Round 1.",
                resolved: true,
              },
            ],
          },
        },
        {
          id: "qa-viewer",
          role: "qa-viewer",
          name: "The Viewer",
          icon: "👁️",
          subtitle: "Audience",
          status: "done",
          durationMs: 7900,
          output: {
            text: "All clear — pacing, emotional arc, and visual storytelling pass.",
          },
        },
      ],
      approvalText: "✓ Approved after 1 revision round",
    },
    {
      id: "polish",
      type: "single",
      agents: [
        {
          id: "editor-final",
          role: "editor-final",
          name: "Final Polish",
          icon: "✨",
          subtitle: "Editor",
          status: "done",
          durationMs: 7500,
          output: {
            text: "Unified tone across revised sections. Arabic register consistent (Gulf dialect maintained). No seams from QA patches.",
          },
        },
      ],
    },
  ],
  activity: [
    { id: "14", timestamp: "12:05:58", agent: "Polish", message: "Final polish complete — storyboard ready", type: "success" },
    { id: "13", timestamp: "12:05:50", agent: "QA", message: "Approved — all issues resolved after 1 round", type: "success" },
    { id: "12", timestamp: "12:05:42", agent: "Cinematic", message: "Revision complete — added establishing shot for coffee farm", type: "success" },
    { id: "11", timestamp: "12:05:30", agent: "Lawyer", message: "1 issue: missing establishing shot in Scene 7 → Cinematic Eye", type: "warning" },
    { id: "10", timestamp: "12:05:28", agent: "Viewer", message: "All clear — pacing and emotional arc pass", type: "success" },
    { id: "9", timestamp: "12:05:20", agent: "Continuity", message: "Merged — 20 scenes, all locations established, no gaps", type: "success" },
    { id: "8", timestamp: "12:05:10", agent: "News Eye", message: "Storyboard B — 16 scenes, tripod coverage style", type: "success" },
    { id: "7", timestamp: "12:05:08", agent: "Cinematic", message: "Storyboard A — 18 scenes, drone + handheld", type: "success" },
    { id: "6", timestamp: "12:04:55", agent: "Editor", message: "Merged scripts — Storyteller opening + Narrator structure, 13 beats", type: "success" },
    { id: "5", timestamp: "12:04:44", agent: "Narrator", message: "Script Draft A — 3 acts, 12 beats, 9:40", type: "success" },
    { id: "4", timestamp: "12:04:43", agent: "Storyteller", message: "Script Draft B — 3 acts, 14 beats, 10:05", type: "success" },
    { id: "3", timestamp: "12:04:38", agent: "Brief", message: "Cinematic documentary — intimate close-ups, natural light", type: "success" },
    { id: "2", timestamp: "12:04:32", agent: "Research", message: "Fact Sheet locked — 14 facts, 3 characters, 5 locations", type: "success" },
    { id: "1", timestamp: "12:04:24", agent: "Pipeline", message: "Started — Saudi Coffee Traditions (10 min, Gulf dialect)", type: "start" },
  ],
};
