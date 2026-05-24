import OpenAI from "openai";
import { JDIntelligenceSchema, type JDIntelligence, safeParse } from "./types";
import { buildPrompt1 } from "./prompts";

// Initialize OpenAI client pointing to the user's proxy
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_1 || "dummy-key-for-build",
  baseURL: process.env.OPENAI_BASE_URL || "https://api.aicredits.in/v1",
});

export async function runPrompt1(rawJD: string): Promise<JDIntelligence> {
  const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL_THINKING || "z-ai/glm-4-32b",
    messages: [
      { role: "system", content: buildPrompt1(rawJD) }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" }
  });

  if ((response as any)?.error) {
    throw new Error(`API Error: ${JSON.stringify((response as any).error)}`);
  }

  const rawResponse = response?.choices?.[0]?.message?.content || "";
  
  const parseResult = safeParse(rawResponse, JDIntelligenceSchema, 1);
  if (!parseResult.success) {
    throw parseResult.error;
  }
  
  return parseResult.data;
}
