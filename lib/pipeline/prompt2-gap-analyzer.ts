import OpenAI from "openai";
import { GapAnalysisSchema, type JDIntelligence, type GapAnalysis, safeParse } from "./types";
import { buildPrompt2 } from "./prompts";
import { TruthRegistry } from "../core/truth-registry";
import { NormalizedResumeType as NormalizedResume } from "./types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_1 || "dummy-key-for-build",
  baseURL: process.env.OPENAI_BASE_URL || "https://api.aicredits.in/v1",
});

export async function runPrompt2(
  jdIntel: JDIntelligence, 
  normalizedResume: any,
  registry: TruthRegistry
): Promise<GapAnalysis> {
  const response = await openai.chat.completions.create({
    model: "prime-intellect/intellect-3",
    messages: [
      { role: "system", content: buildPrompt2(jdIntel, normalizedResume, registry) }
    ],
    temperature: 0.1,
  });

  if ((response as any)?.error) {
    throw new Error(`API Error: ${JSON.stringify((response as any).error)}`);
  }

  const rawResponse = response?.choices?.[0]?.message?.content || "";
  
  const parseResult = safeParse(rawResponse, GapAnalysisSchema, 2);
  if (!parseResult.success) {
    throw parseResult.error;
  }
  
  return parseResult.data;
}
