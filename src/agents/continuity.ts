import { anthropic } from "../lib/anthropic.js";
import { storyboardSchema, type Storyboard } from "../types/scene.js";
import type { ContinuityInput } from "../types/continuity.js";

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 8192;
const MAX_RETRIES = 2;

function buildSystemPrompt(): string {
  return `You are the Continuity Checker for Fanzy, an Arabic video storyboard system.

You receive two storyboards from different directors — Cinematic Eye and News Eye.
Your job:
1. Select the best visual approach for each scene (one director may be stronger for
   certain scene types)
2. Merge into one unified storyboard
3. Validate spatial continuity — characters can't teleport between scenes, locations
   must flow logically
4. Validate temporal continuity — time of day progression makes sense, seasonal cues
   are consistent
5. Check that every name matches the Name Registry exactly
6. Ensure smooth visual transitions between merged scenes

Output format: same storyboard JSON schema as input, without the persona field.
All text in Arabic. Use ONLY names from the Name Registry.
Respond ONLY with the JSON object.`;
}

function buildUserPrompt(input: ContinuityInput): string {
  const parts = [
    "--- ورقة الحقائق ---",
    JSON.stringify(input.factSheet, null, 2),
    "",
    "--- ستوري بورد أ (العين السينمائية) ---",
    JSON.stringify(input.storyboardA, null, 2),
    "",
    "--- ستوري بورد ب (عين الأخبار) ---",
    JSON.stringify(input.storyboardB, null, 2),
  ];

  if (input.revisionNotes) {
    parts.push(`\n--- ملاحظات المراجعة ---\n${input.revisionNotes}`);
  }

  parts.push(
    "\nادمج الستوري بوردين وتحقق من استمرارية المكان والزمان والأسماء.",
  );

  return parts.join("\n");
}

export async function runContinuityChecker(
  input: ContinuityInput,
): Promise<Storyboard> {
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

      return storyboardSchema.parse(JSON.parse(textBlock.text));
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      }
    }
  }

  throw new Error(
    `Continuity Checker failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`,
  );
}
