import { anthropic } from "../lib/anthropic.js";
import { storyboardSchema, type Storyboard } from "../types/scene.js";
import type { DirectorInput } from "../types/director.js";

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 8192;
const MAX_RETRIES = 2;

const PERSONA_PROMPTS: Record<string, string> = {
  cinematic: `You are the Cinematic Eye Director. You think in film language — dramatic
compositions, depth of field, motivated camera movement, golden hour lighting, tracking shots.
Every frame tells a story visually. You favor wide establishing shots, deliberate pacing, and
visual symbolism.`,

  news: `You are the News Eye Director. You think in documentary language — handheld energy,
natural lighting, interview setups, b-roll coverage, tight framing on faces for emotion.
You favor efficiency, clarity, and real-world authenticity. Every shot serves the information.`,
};

function buildSystemPrompt(persona: string): string {
  return `You are a Director for Fanzy, an Arabic video storyboard system.

${PERSONA_PROMPTS[persona]}

You receive the merged script, Fact Sheet, and Visual Brief. Convert each script scene
into a visual scene card with specific camera, lighting, and composition instructions.

Output a JSON storyboard matching this schema:
{
  "scenes": [{
    "sceneNumber": 1,
    "shotType": "string — Arabic (واسعة/متوسطة/قريبة/قريبة جداً)",
    "cameraMovement": "string — Arabic (ثابتة/تتبع/بان/زوم)",
    "cameraAngle": "string — Arabic (مستوى العين/علوي/سفلي)",
    "composition": "string — Arabic description",
    "lighting": "string — Arabic",
    "subjects": ["who/what is in frame"],
    "action": "string — Arabic",
    "narration": "string — Arabic",
    "dialogue": [{ "character": "string", "line": "string" }],
    "durationSeconds": number,
    "transition": "string — Arabic (قطع/ذوبان/إلخ)",
    "notes": "string — director notes in Arabic"
  }],
  "totalDurationSeconds": number,
  "persona": "${persona}"
}

Rules:
- Use ONLY names from the Name Registry
- All text in Arabic
- Every script scene maps to one or more visual scene cards
- Camera instructions must be specific and actionable for a videographer

Respond ONLY with the JSON object.`;
}

function buildUserPrompt(input: DirectorInput): string {
  const parts = [
    "--- ورقة الحقائق ---",
    JSON.stringify(input.factSheet, null, 2),
    "",
    "--- الموجز البصري ---",
    JSON.stringify(input.visualBrief, null, 2),
    "",
    "--- السيناريو ---",
    JSON.stringify(input.script, null, 2),
  ];

  if (input.revisionNotes) {
    parts.push(`\n--- ملاحظات المراجعة ---\n${input.revisionNotes}`);
  }

  parts.push("\nحوّل السيناريو إلى ستوري بورد بصري مفصل.");

  return parts.join("\n");
}

export async function runDirector(input: DirectorInput): Promise<Storyboard> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: buildSystemPrompt(input.persona),
        messages: [{ role: "user", content: buildUserPrompt(input) }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("Claude returned no text content");
      }

      return storyboardSchema.parse(JSON.parse(textBlock.text));
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      }
    }
  }

  throw new Error(
    `Director (${input.persona}) failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`,
  );
}
