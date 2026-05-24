import OpenAI from "openai";
import { AuditResultSchema, type AuditResult, type OptimizedResume, safeParse } from "./types";
import { buildPrompt4 } from "./prompts";
import { TruthRegistry } from "../core/truth-registry";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_1 || "dummy-key-for-build",
  baseURL: process.env.OPENAI_BASE_URL || "https://api.aicredits.in/v1",
});

export async function runPrompt4(
  resumeJSON: OptimizedResume,
  registry: TruthRegistry
): Promise<AuditResult> {
  const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL_THINKING || "z-ai/glm-4-32b",
    messages: [
      { role: "system", content: buildPrompt4(resumeJSON, registry) }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" }
  });

  if ((response as any)?.error) {
    throw new Error(`API Error: ${JSON.stringify((response as any).error)}`);
  }

  const rawResponse = response?.choices?.[0]?.message?.content || "";
  
  const parseResult = safeParse(rawResponse, AuditResultSchema, 4);
  if (!parseResult.success) {
    throw parseResult.error;
  }
  
  return parseResult.data;
}
