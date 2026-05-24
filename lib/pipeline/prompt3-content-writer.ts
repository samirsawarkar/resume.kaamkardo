import OpenAI from "openai";
import { OptimizedResumeSchema, type OptimizedResume, type JDIntelligence, type GapAnalysis, safeParse } from "./types";
import { buildPrompt3 } from "./prompts";
import { TruthRegistry } from "../core/truth-registry";
import { NormalizedResumeType as NormalizedResume } from "./types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_1 || "dummy-key-for-build",
  baseURL: process.env.OPENAI_BASE_URL || "https://api.aicredits.in/v1",
});

export async function runPrompt3(
  jdIntel: JDIntelligence, 
  gapAnalysis: GapAnalysis, 
  normalizedResume: any,
  registry: TruthRegistry,
  fixInstructions?: string
): Promise<OptimizedResume> {
  const response = await openai.chat.completions.create({
    model: "z-ai/glm-4.5-air",
    messages: [
      { role: "system", content: buildPrompt3(jdIntel, gapAnalysis, normalizedResume, registry, fixInstructions) }
    ],
    temperature: 0.2,
  });

  if ((response as any)?.error) {
    throw new Error(`API Error: ${JSON.stringify((response as any).error)}`);
  }

  const rawResponse = response?.choices?.[0]?.message?.content || "";
  
  const parseResult = safeParse(rawResponse, OptimizedResumeSchema, 3);
  if (!parseResult.success) {
    throw parseResult.error;
  }
  
  return parseResult.data;
}
