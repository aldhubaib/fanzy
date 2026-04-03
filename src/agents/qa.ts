import { anthropic } from "../lib/anthropic.js";
import { qaReportSchema, type QAReport } from "../types/qa-report.js";
import type { QAInput } from "../types/qa.js";

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 4096;
const MAX_RETRIES = 2;

const PERSONA_PROMPTS: Record<string, string> = {
  lawyer: `You are The Lawyer — a strict accuracy reviewer.

Your criteria:
- Every fact in the storyboard matches the Fact Sheet exactly
- Every name uses the canonical spelling from the Name Registry (no variants, no drift)
- Timeline events are in the correct order
- Locations match their descriptions
- No hallucinated facts that aren't in the source material
- Arabic grammar and diacritics are correct
- No dialect mixing (formal/colloquial consistency)

You are merciless about accuracy. A single wrong name spelling is a critical issue.`,

  viewer: `You are The Viewer — an audience experience reviewer.

Your criteria:
- Does the story flow naturally? Would a viewer stay engaged?
- Are transitions between scenes smooth or jarring?
- Is the pacing appropriate for the target audience?
- Do visual compositions create emotional impact?
- Is the narration compelling or flat?
- Would a videographer understand every instruction clearly?
- Are there missed opportunities for visual storytelling?

You judge from the audience's perspective, not technical accuracy.`,
};

function buildSystemPrompt(persona: string, round: number): string {
  return `You are a QA Reviewer for Fanzy, an Arabic video storyboard system.

${PERSONA_PROMPTS[persona]}

${round > 1 ? `This is revision round ${round}. Focus on whether previous issues were properly addressed.` : ""}

Output a JSON QA report matching this schema:
{
  "persona": "${persona}",
  "overallScore": number (1-10),
  "passed": boolean (true if score >= 7 and no critical issues),
  "issues": [{
    "severity": "critical" | "major" | "minor",
    "category": "string (e.g. fact_accuracy, name_consistency, flow, pacing, visual_clarity)",
    "location": "string (scene number or act reference)",
    "description": "string — Arabic",
    "suggestion": "string — Arabic",
    "targetAgent": "AGENT_ROLE (which agent should fix this)"
  }],
  "summary": "string — Arabic overall assessment"
}

Valid targetAgent values: SCRIPTWRITER_NARRATOR, SCRIPTWRITER_STORYTELLER,
EDITOR_MERGE, DIRECTOR_CINEMATIC, DIRECTOR_NEWS, CONTINUITY_CHECKER.

Set passed to true ONLY if overallScore >= 7 AND there are zero critical issues.
Respond ONLY with the JSON object.`;
}

function buildUserPrompt(input: QAInput): string {
  const parts = [
    "--- ورقة الحقائق ---",
    JSON.stringify(input.factSheet, null, 2),
    "",
    "--- الموجز البصري ---",
    JSON.stringify(input.visualBrief, null, 2),
    "",
    "--- السيناريو المدمج ---",
    JSON.stringify(input.mergedScript, null, 2),
    "",
    "--- الستوري بورد ---",
    JSON.stringify(input.storyboard, null, 2),
  ];

  if (input.previousReport) {
    parts.push(
      "",
      "--- التقرير السابق ---",
      JSON.stringify(input.previousReport, null, 2),
    );
  }

  parts.push("\nراجع كل شيء أعلاه وأنتج تقرير مراجعة الجودة.");

  return parts.join("\n");
}

export async function runQA(input: QAInput): Promise<QAReport> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: buildSystemPrompt(input.persona, input.round),
        messages: [{ role: "user", content: buildUserPrompt(input) }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("Claude returned no text content");
      }

      return qaReportSchema.parse(JSON.parse(textBlock.text));
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      }
    }
  }

  throw new Error(
    `QA (${input.persona}) failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`,
  );
}
