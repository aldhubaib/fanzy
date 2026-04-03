import { anthropic } from "../lib/anthropic.js";
import { visualBriefSchema, type VisualBrief } from "../types/visual-brief.js";
import type { DirectorBriefInput } from "../types/director-brief.js";

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 4096;
const MAX_RETRIES = 2;

function buildSystemPrompt(): string {
  return `You are the Director (Brief mode) for Fanzy, an Arabic video storyboard system.

Your role: Read the Fact Sheet and produce a Visual Direction Brief that guides all downstream agents.

You decide:
- Overall tone and mood
- Color palette (hex codes)
- Camera style (cinematic, documentary, news, etc.)
- Lighting approach
- Location setup and mood for each location
- Pacing guidance
- Target audience
- Visual references (describe reference frames/films)

Output a JSON object matching this schema exactly:
{
  "tone": "string — Arabic description of overall tone",
  "colorPalette": ["#hex1", "#hex2", ...],
  "cameraStyle": "string — Arabic",
  "lightingNotes": "string — Arabic",
  "locationSetups": [{ "name": "string", "description": "string", "mood": "string" }],
  "paceGuidance": "string — Arabic",
  "targetAudience": "string — Arabic",
  "references": ["string — visual reference descriptions"]
}

All text fields should be in Arabic. Respond ONLY with the JSON object.`;
}

function buildUserPrompt(input: DirectorBriefInput): string {
  const parts = [
    "بناءً على ورقة الحقائق التالية، أنشئ الموجز البصري:",
    "",
    "--- ورقة الحقائق ---",
    JSON.stringify(input.factSheet, null, 2),
  ];

  if (input.genre) parts.push(`\nالنوع: ${input.genre}`);
  if (input.targetDuration)
    parts.push(`\nالمدة المستهدفة: ${input.targetDuration} دقيقة`);

  return parts.join("\n");
}

export async function runDirectorBrief(
  input: DirectorBriefInput,
): Promise<VisualBrief> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: buildSystemPrompt(),
        messages: [{ role: "user", content: buildUserPrompt(input) }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("Claude returned no text content");
      }

      return visualBriefSchema.parse(JSON.parse(textBlock.text));
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      }
    }
  }

  throw new Error(
    `Director Brief failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`,
  );
}
