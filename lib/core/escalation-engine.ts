// ═══════════════════════════════════════════════════════════════
// lib/core/escalation-engine.ts
// Targeted repair prompts for failed sections.
// ═══════════════════════════════════════════════════════════════

import OpenAI from "openai";
import { TruthRegistry } from "./truth-registry";
import { JDIntelligence, NormalizedResumeType, OptimizedResume } from "../pipeline/types";
import { safeParseAIResponse } from "./safe-parser";
import { z } from "zod";
import { coerceToSchema } from "./schema-coercer";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_1 || "dummy-key-for-build",
  baseURL: process.env.OPENAI_BASE_URL || "https://api.aicredits.in/v1",
});

async function callHaiku(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL_THINKING || "z-ai/glm-4-32b",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.2,
      response_format: { type: "json_object" }
    });
    return response.choices[0]?.message?.content || "{}";
  } catch (e) {
    return "{}";
  }
}

export async function escalateFailedSections(
  failedSections: string[],
  registry: TruthRegistry,
  context: { jdIntel: JDIntelligence; normalizedResume: NormalizedResumeType }
): Promise<Partial<OptimizedResume>> {
  
  const repaired: Partial<OptimizedResume> = {};

  if (failedSections.includes('skills')) {
    const prompt = `Return ONLY a JSON array of skill categories.
No other text. No explanation.
Required skills to include: ${JSON.stringify(registry.jd?.required_skills_verbatim || [])}
Original skills: ${JSON.stringify(context.normalizedResume.skills || [])}
Format: [{"category": "string", "items": ["string"]}]
5 categories minimum. 3 items per category minimum.`;
    
    const raw = await callHaiku(prompt);
    // Minimal coercion inside escalation
    const parsed = safeParseAIResponse(raw, z.any(), registry, 'escalation-skills', []);
    if (parsed.data && Array.isArray(parsed.data)) {
      repaired.skills = parsed.data;
    }
  }

  if (failedSections.includes('experience')) {
    const prompt = `Return ONLY a JSON array of experience entries.
No other text. No explanation.
Use ONLY these company names: ${JSON.stringify(registry.legitimate_companies || [])}
If no company match: use 'Independent Project'.
Original experience: ${JSON.stringify(context.normalizedResume.experience || [])}
Format: [{"role": "string", "company": "string", "duration": "string", "location": "string", "subtitle": "string", "bullets": ["string"]}]`;
    
    const raw = await callHaiku(prompt);
    const parsed = safeParseAIResponse(raw, z.any(), registry, 'escalation-exp', []);
    if (parsed.data && Array.isArray(parsed.data)) {
      repaired.experience = parsed.data;
    }
  }

  if (failedSections.includes('projects')) {
    const prompt = `Return ONLY a JSON array of project entries.
No other text. No explanation.
Include ALL of these projects: ${JSON.stringify((registry.original_projects || []).map(p => p.name))}
Original projects: ${JSON.stringify(context.normalizedResume.projects || [])}
Format: [{"name": "string", "subtitle": "string", "duration": "string", "bullets": ["string"]}]`;
    
    const raw = await callHaiku(prompt);
    const parsed = safeParseAIResponse(raw, z.any(), registry, 'escalation-proj', []);
    if (parsed.data && Array.isArray(parsed.data)) {
      repaired.projects = parsed.data;
    }
  }

  // After repair, run the whole thing through the schema coercer one last time 
  // to ensure types are perfect.
  const coercedRepaired = coerceToSchema(repaired, registry);
  
  return coercedRepaired;
}
