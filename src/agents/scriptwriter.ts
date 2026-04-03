import { anthropic } from "../lib/anthropic.js";
import { scriptSchema, type Script } from "../types/script.js";
import type { ScriptwriterInput } from "../types/scriptwriter.js";

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 8192;
const MAX_RETRIES = 2;

const PERSONA_PROMPTS: Record<string, string> = {
  narrator: `You are the Narrator Scriptwriter — you favor rich, evocative narration.
Your scripts are driven by a strong narrative voice. Dialogue is minimal; instead you paint
scenes through description and voiceover. Think documentary filmmaker.`,

  storyteller: `You are the Storyteller Scriptwriter — you favor dialogue and human moments.
Your scripts are driven by character interaction. People speak, react, argue, connect.
Narration bridges scenes but never dominates. Think drama director.`,
};

function buildSystemPrompt(persona: string): string {
  return `You are a Scriptwriter for Fanzy, an Arabic video storyboard system.

${PERSONA_PROMPTS[persona]}

You receive a locked Fact Sheet (immutable — every name and fact must match exactly)
and a Visual Direction Brief (tone, style, pacing guidance).

Output a JSON script matching this schema:
{
  "acts": [{
    "actNumber": 1,
    "title": "string — Arabic",
    "scenes": [{
      "sceneNumber": 1,
      "location": "string — Arabic",
      "timeOfDay": "string — Arabic",
      "narration": "string — Arabic narration text",
      "dialogue": [{ "character": "string", "line": "string" }],
      "actionNotes": "string — Arabic",
      "durationSeconds": number
    }]
  }],
  "totalDurationSeconds": number,
  "persona": "${persona}"
}

Rules:
- Use ONLY names from the Name Registry — exact canonical spelling
- All text in Arabic
- Duration must respect the target if provided
- Each scene needs a clear location from the Fact Sheet locations

Respond ONLY with the JSON object.`;
}

function buildUserPrompt(input: ScriptwriterInput): string {
  const parts = [
    "--- ورقة الحقائق ---",
    JSON.stringify(input.factSheet, null, 2),
    "",
    "--- الموجز البصري ---",
    JSON.stringify(input.visualBrief, null, 2),
  ];

  if (input.targetDuration) {
    parts.push(`\nالمدة المستهدفة: ${input.targetDuration} دقيقة`);
  }

  if (input.revisionNotes) {
    parts.push(`\n--- ملاحظات المراجعة ---\n${input.revisionNotes}`);
  }

  parts.push("\nاكتب السيناريو بناءً على المعطيات أعلاه.");

  return parts.join("\n");
}

export async function runScriptwriter(
  input: ScriptwriterInput,
): Promise<Script> {
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

      return scriptSchema.parse(JSON.parse(textBlock.text));
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      }
    }
  }

  throw new Error(
    `Scriptwriter (${input.persona}) failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`,
  );
}
