import "server-only";
import { GoogleGenAI } from "@google/genai";
import { llmConfig } from "@/lib/config";
import { CATEGORIES, TIMEOUTS } from "@/lib/constants";
import { EXTRACTION_SYSTEM_PROMPT, buildUserPrompt } from "./extraction-prompt";
import { extractionResponseSchema, extractionSchema, type Extraction } from "./extraction-schema";

/**
 * Thin server-side adapter around the LLM. Swap the body of `generateStructured`
 * to change provider; callers only depend on `extractProduct`.
 */

export class ExtractionError extends Error {
  constructor(message: string, public readonly status = 502) {
    super(message);
    this.name = "ExtractionError";
  }
}

let ai: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (!ai) ai = new GoogleGenAI({ apiKey: llmConfig().apiKey });
  return ai;
}

async function generateStructured(raw: string, signal: AbortSignal): Promise<unknown> {
  const { model } = llmConfig();
  const res = await client().models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: buildUserPrompt(raw) }] }],
    config: {
      systemInstruction: EXTRACTION_SYSTEM_PROMPT.replace("{{CATEGORIES}}", CATEGORIES.join(", ")),
      responseMimeType: "application/json",
      responseSchema: extractionResponseSchema,
      temperature: 0.1,
      abortSignal: signal,
    },
  });
  const text = res.text;
  if (!text) throw new ExtractionError("The model returned an empty response.");
  try {
    return JSON.parse(text);
  } catch {
    throw new ExtractionError("The model response was not valid JSON.");
  }
}

export async function extractProduct(raw: string): Promise<Extraction> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUTS.extractionMs);
  try {
    const json = await generateStructured(raw, controller.signal);
    const parsed = extractionSchema.safeParse(json);
    if (!parsed.success) {
      console.error("[extract] schema validation failed", parsed.error.issues);
      throw new ExtractionError("The model response did not match the product schema.");
    }
    return parsed.data;
  } catch (e) {
    if (e instanceof ExtractionError) throw e;
    if (controller.signal.aborted) throw new ExtractionError("Extraction timed out. Please try again.", 504);
    console.error("[extract] LLM call failed", e);
    throw new ExtractionError("The extraction service is unavailable right now.");
  } finally {
    clearTimeout(timer);
  }
}
