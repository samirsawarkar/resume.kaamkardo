// ═══════════════════════════════════════════════════════════════
// lib/pipeline/normalizer.ts
// Zone 1: Validates, sanitizes, and normalizes raw inputs.
// ═══════════════════════════════════════════════════════════════

import OpenAI from "openai";
import { safeParseAIResponse } from "../core/safe-parser";
import { NormalizedResumeSchema, NormalizedJDSchema, NormalizedResumeType, NormalizedJDType } from "./types";
import { UNIVERSAL_HEADER } from "./prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_1 || "dummy-key-for-build",
  baseURL: process.env.OPENAI_BASE_URL || "https://api.aicredits.in/v1",
});

const NORMALIZE_RESUME_PROMPT = UNIVERSAL_HEADER + `
You are a strict data extraction engine. 
Extract the provided raw resume text into a perfectly structured JSON object matching the requested schema.
- Extract company names exactly as written.
- Extract all projects and metrics.
- Leave fields as empty strings if not present, do NOT invent data.

YOUR RESPONSE MUST MATCH THIS EXACT JSON FORMAT:
{
  "header": { "name": "", "email": "", "phone": "", "location": "", "tagline": "", "links": {} },
  "summary": "",
  "skills": [""],
  "experience": [
    { "company": "", "role": "", "duration": "", "location": "", "bullets": [""] }
  ],
  "projects": [
    { "name": "", "tech_stack": [""], "duration": "", "bullets": [""] }
  ],
  "education": [
    { "degree": "", "institution": "", "year": "" }
  ]
}
`;

const NORMALIZE_JD_PROMPT = UNIVERSAL_HEADER + `
You are a strict data extraction engine.
Extract the company name, location, and role title from the provided Job Description.
If a company is not explicitly stated, try to infer it from the email or footer.
If a location is not stated, return "Remote".
Leave raw_text as the exact original input provided.

YOUR RESPONSE MUST MATCH THIS EXACT JSON FORMAT:
{
  "company": "",
  "location": "",
  "role_title": ""
}
`;

export async function normalizeResume(rawResume: string): Promise<NormalizedResumeType> {
  const prompt = `INPUT:\n${rawResume}`;
  // console.log(`\n\n=== [Step0_NormalizeResume] PROMPT ===\n`, NORMALIZE_RESUME_PROMPT + '\n' + prompt);

  const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL_THINKING || "z-ai/glm-4-32b",
    messages: [
      { role: "system", content: NORMALIZE_RESUME_PROMPT },
      { role: "user", content: prompt }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" }
  });

  if ((response as any)?.error) {
    throw new Error(`API Error: ${JSON.stringify((response as any).error)}`);
  }

  const rawResponse = response?.choices?.[0]?.message?.content || "";
  // console.log(`\n=== [Step0_NormalizeResume] RAW LLM OUTPUT ===\n`, rawResponse);
  
  const parseResult = safeParseAIResponse(
    rawResponse, 
    NormalizedResumeSchema, 
    {} as any, 
    'Step0_NormalizeResume',
    {
      header: { name: "", email: "", phone: "", location: "", links: {} },
      skills: [],
      experience: [],
      projects: [],
      education: [],
    }
  );
  
  if (!parseResult.data) {
    return {
      header: { name: "", email: "", phone: "", location: "", links: {} },
      skills: [],
      experience: [],
      projects: [],
      education: [],
    } as any;
  }

  const data = parseResult.data as any;
  data.raw_text = rawResume;
  // console.log(`\n=== [Step0_NormalizeResume] PARSED ===\n`, JSON.stringify(data, null, 2));
  return data;
}

export async function normalizeJD(rawJD: string): Promise<NormalizedJDType> {
  const prompt = `INPUT:\n${rawJD}`;
  // console.log(`\n\n=== [Step0_NormalizeJD] PROMPT ===\n`, NORMALIZE_JD_PROMPT + '\n' + prompt);

  const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL_THINKING || "z-ai/glm-4-32b",
    messages: [
      { role: "system", content: NORMALIZE_JD_PROMPT },
      { role: "user", content: prompt }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" }
  });

  if ((response as any)?.error) {
    throw new Error(`API Error: ${JSON.stringify((response as any).error)}`);
  }

  const rawResponse = response?.choices?.[0]?.message?.content || "";
  // console.log(`\n=== [Step0_NormalizeJD] RAW LLM OUTPUT ===\n`, rawResponse);
  
  const parseResult = safeParseAIResponse(
    rawResponse, 
    NormalizedJDSchema, 
    {} as any, 
    'Step0_NormalizeJD',
    {
      company: "",
      location: "",
      role: "",
      raw_text: rawJD
    }
  );
  
  if (!parseResult.data) {
    return {
      company: "",
      location: "",
      role: "",
      raw_text: rawJD
    };
  }

  const data = parseResult.data as any;
  data.raw_text = rawJD;
  // console.log(`\n=== [Step0_NormalizeJD] PARSED ===\n`, JSON.stringify(data, null, 2));
  return data;
}
