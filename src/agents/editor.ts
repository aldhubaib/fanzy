import { anthropic } from "../lib/anthropic.js";
import { scriptSchema, type Script } from "../types/script.js";
import { storyboardSchema, type Storyboard } from "../types/scene.js";
import type { EditorMergeInput, EditorFinalInput } from "../types/editor.js";

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 8192;
const MAX_RETRIES = 2;

async function callClaude(
  system: string,
  user: string,
): Promise<string> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        messages: [{ role: "user", content: user }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("Claude returned no text content");
      }

      return textBlock.text;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      }
    }
  }

  throw new Error(
    `Editor failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`,
  );
}

export async function runEditorMerge(input: EditorMergeInput): Promise<Script> {
  const system = `You are the Editor (Merge mode) for Fanzy, an Arabic video storyboard system.

You receive two scripts from different scriptwriters — one narration-heavy (Narrator),
one dialogue-heavy (Storyteller). Your job:
1. Compare both scripts against the Fact Sheet
2. Select the strongest scenes from each
3. Merge into one cohesive script — unified voice, smooth transitions
4. Fix any inconsistencies between the merged parts

Output format: same JSON schema as the input scripts, with persona set to "narrator".
All text in Arabic. Use ONLY names from the Name Registry.
Respond ONLY with the JSON object.`;

  const user = [
    "--- ورقة الحقائق ---",
    JSON.stringify(input.factSheet, null, 2),
    "",
    "--- السيناريو أ (الراوي) ---",
    JSON.stringify(input.scriptA, null, 2),
    "",
    "--- السيناريو ب (القاص) ---",
    JSON.stringify(input.scriptB, null, 2),
    input.revisionNotes
      ? `\n--- ملاحظات المراجعة ---\n${input.revisionNotes}`
      : "",
    "\nادمج أفضل عناصر السيناريوين في سيناريو واحد متماسك.",
  ].join("\n");

  const text = await callClaude(system, user);
  return scriptSchema.parse(JSON.parse(text));
}

export async function runEditorFinal(
  input: EditorFinalInput,
): Promise<Storyboard> {
  const system = `You are the Editor (Final Polish) for Fanzy, an Arabic video storyboard system.

You receive the storyboard after QA review. Your job:
1. Apply any QA corrections smoothly
2. Unify tone and style across all scenes
3. Smooth revision seams — ensure edits blend naturally
4. Final quality check on Arabic language, names, and facts

Output format: same storyboard JSON schema as input.
All text in Arabic. Use ONLY names from the Name Registry.
Respond ONLY with the JSON object.`;

  const user = [
    "--- ورقة الحقائق ---",
    JSON.stringify(input.factSheet, null, 2),
    "",
    "--- الستوري بورد ---",
    JSON.stringify(input.storyboard, null, 2),
    "",
    "--- تقارير مراجعة الجودة ---",
    JSON.stringify(input.qaReports, null, 2),
    input.revisionNotes
      ? `\n--- ملاحظات المراجعة ---\n${input.revisionNotes}`
      : "",
    "\nنفذ التعديلات النهائية وأنتج الستوري بورد الجاهز للإنتاج.",
  ].join("\n");

  const text = await callClaude(system, user);
  return storyboardSchema.parse(JSON.parse(text));
}
