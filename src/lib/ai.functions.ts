import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { AI_MODEL, createLovableAiGatewayProvider } from "./ai-gateway.server";

const ATS_SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) analyst. Analyze the following resume text and return ONLY a valid JSON object with no explanation, no markdown, no backticks. The JSON must follow this exact structure:
{
"overall_score": number between 0 and 100,
"keyword_score": number between 0 and 100,
"formatting_score": number between 0 and 100,
"readability_score": number between 0 and 100,
"section_score": number between 0 and 100,
"issues": [ { "type": "critical|warning|suggestion", "message": "string", "section": "string" } ],
"missing_keywords": ["string"],
"strengths": ["string"],
"improvements": ["string"]
}`;

function gateway() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured. Missing LOVABLE_API_KEY.");
  return createLovableAiGatewayProvider(key);
}

function stripFences(text: string) {
  return text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
}

export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ resumeText: z.string().min(30), jobTitle: z.string().optional() }).parse(data),
  )
  .handler(async ({ data }) => {
    const provider = gateway();
    const result = await generateText({
      model: provider(AI_MODEL),
      system: ATS_SYSTEM_PROMPT,
      prompt: `Target role: ${data.jobTitle || "not specified"}\n\nRESUME TEXT:\n${data.resumeText.slice(0, 18000)}`,
    });
    return { raw: stripFences(result.text) };
  });

const ACTION_PROMPTS: Record<string, string> = {
  summary:
    "Rewrite the professional summary so it is ATS-optimized, in active voice, keyword rich, and under 5 sentences. Return only the rewritten summary text.",
  bullets:
    "Rewrite each bullet point using the STAR format (Situation, Task, Action, Result) with strong action verbs and quantified results where plausible. Return only the rewritten bullets, one per line, no numbering or dashes.",
  keywords:
    "Naturally insert the provided missing keywords into the text without keyword stuffing. Keep the meaning and length similar. Return only the revised text.",
  formatting:
    "Fix formatting for ATS parsing: plain text, no tables, no special characters, consistent tense and punctuation. Return only the corrected text.",
  generate_summary:
    "Write a professional resume summary for the given role and skills. ATS-optimized, active voice, under 5 sentences. Return only the summary text.",
  experience:
    "Rewrite this work experience section content for clarity and impact using strong action verbs and measurable outcomes. Return only the revised text.",
  education:
    "Tidy up this education section for a clean, ATS-friendly resume. Return only the revised text.",
  skills:
    "Clean up and prioritize this skills list for ATS keyword matching. Return only a comma-separated skills list.",
};

export const rewriteSection = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        action: z.enum([
          "summary",
          "bullets",
          "keywords",
          "formatting",
          "generate_summary",
          "experience",
          "education",
          "skills",
        ]),
        content: z.string().min(1),
        context: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const provider = gateway();
    const result = await generateText({
      model: provider(AI_MODEL),
      system: `You are an expert resume writer specialising in ATS-optimized resumes. ${ACTION_PROMPTS[data.action]} Never add commentary.`,
      prompt: `${data.context ? `Context: ${data.context}\n\n` : ""}CONTENT:\n${data.content.slice(0, 8000)}`,
    });
    return { text: result.text.trim() };
  });
