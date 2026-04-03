import { anthropic } from "../lib/anthropic.js";
import { factSheetSchema, type FactSheet } from "../types/fact-sheet.js";
import type { ResearcherInput } from "../types/researcher.js";

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 4096;
const MAX_RETRIES = 2;

function buildSystemPrompt(): string {
  return `You are the Researcher agent for Fanzy, an Arabic video storyboard system.

Your job: analyze raw Arabic story text and extract a structured Fact Sheet that downstream agents will reference. This Fact Sheet becomes IMMUTABLE once you produce it — every other agent in the pipeline reads it but cannot change it.

CRITICAL RULES:
- Extract ONLY what is explicitly stated or directly implied in the source text
- NEVER invent facts, names, or events not present in the source
- Preserve exact Arabic spellings — do not "correct" character names
- If the text is ambiguous, note the ambiguity in the fact value rather than guessing

OUTPUT FORMAT:
You MUST respond with a single JSON object matching this exact structure:

{
  "facts": [
    { "key": "string (fact category)", "value": "string (the fact in Arabic)", "source": "string (which part of the text)" }
  ],
  "nameRegistry": [
    { "canonical": "string (authoritative Arabic spelling)", "variants": ["string (aliases)"], "role": "string (brief role description in Arabic)" }
  ],
  "timeline": [
    { "order": 0, "description": "string (event description in Arabic)", "characters": ["string (canonical names involved)"] }
  ],
  "locations": [
    { "name": "string (location name in Arabic)", "description": "string (description)", "events": [0] }
  ]
}

FACT CATEGORIES TO EXTRACT:
- setting (الإطار الزمني والمكاني)
- theme (الموضوع الرئيسي)
- tone (النبرة العامة)
- conflict (الصراع الرئيسي)
- resolution (الحل أو النهاية)
- target_audience (الجمهور المستهدف)
- cultural_context (السياق الثقافي)

NAME REGISTRY RULES:
- Each character gets exactly ONE canonical name entry
- The canonical field is the most complete version of their name as it appears in the text
- Variants include nicknames, shortened names, titles, or alternate spellings found in the text
- Role should be in Arabic and describe the character's function in the story

TIMELINE RULES:
- Events are ordered by narrative sequence (0-indexed)
- Each event references characters by their canonical name from the name registry
- Keep descriptions concise but complete

LOCATION RULES:
- Extract every distinct location mentioned
- Link locations to timeline events by order number

Respond ONLY with the JSON object. No markdown, no explanation, no wrapping.`;
}

function buildUserPrompt(input: ResearcherInput): string {
  const parts = ["حلل النص التالي واستخرج ورقة الحقائق الكاملة:"];

  if (input.genre) {
    parts.push(`النوع: ${input.genre}`);
  }
  if (input.dialect) {
    parts.push(`اللهجة: ${input.dialect}`);
  }

  parts.push("---", input.sourceText);

  return parts.join("\n\n");
}

export async function runResearcher(
  input: ResearcherInput,
): Promise<FactSheet> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: buildSystemPrompt(),
        messages: [{ role: "user", content: buildUserPrompt(input) }],
      });

      const textBlock = response.content.find(
        (block) => block.type === "text",
      );
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("Claude returned no text content");
      }

      const parsed: unknown = JSON.parse(textBlock.text);
      const factSheet = factSheetSchema.parse(parsed);

      return factSheet;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < MAX_RETRIES) {
        const backoffMs = 1000 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  throw new Error(
    `Researcher agent failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`,
  );
}
