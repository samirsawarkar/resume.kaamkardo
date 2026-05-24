import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { withAuth } from "@/src/lib/auth-guard";
import { AppError } from "@/src/lib/errors";
import { extractJson } from "@/src/lib/json-extractor";

let requestCount = 0;
function getRotatedClient() {
  requestCount++;
  const key1 = process.env.OPENAI_API_KEY_1;
  const key2 = process.env.OPENAI_API_KEY_2;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.aicredits.in/v1";
  
  const key = (requestCount % 2 === 0 && key2) ? key2 : (key1 || process.env.OPENAI_API_KEY_1);
  
  return new OpenAI({
    apiKey: key,
    baseURL: baseUrl,
  });
}

const EXTRACTION_PROMPT = `ROLE: You are a senior resume parser with expert knowledge of resume formats 
across Indian, European, and US markets. You extract information with 100% 
fidelity — you never add, infer, or embellish. You only extract what exists.

TASK: Parse the resume text provided and return structured JSON.

RULES:
- Extract verbatim. Do not rephrase anything yet.
- If a field is missing, set it to null. Never guess.
- Detect implicit information: if someone says "reduced load time from 
  3s to 0.8s" — that contains a metric. Flag it.
- Classify each bullet as: HAS_METRIC | NO_METRIC | WEAK_VERB | STRONG
- Detect tech stack mentions even inside sentences.
- Output ONLY valid JSON. Zero preamble.

OUTPUT JSON SCHEMA:
{
  "personal": { "name": "", "email": "", "phone": "", "location": "", "links": [] },
  "summary": { "raw_text": "", "quality_score": 5, "issues": [] },
  "experience": [{
    "role": "", "company": "", "duration": "", "bullets": [{
      "raw": "original text",
      "classification": "HAS_METRIC|NO_METRIC|WEAK_VERB|STRONG",
      "detected_metric": "string or null",
      "detected_verb": "string"
    }]
  }],
  "projects": [{ "name": "", "tech_stack": [], "duration": "", "bullets": [], "deployed": false }],
  "education": [{ "degree": "", "institution": "", "score": "", "year": "", "courses": [] }],
  "skills": { "raw_list": [], "detected_categories": {} },
  "certifications": [],
  "publications": [],
  "open_source": [],
  "missing_sections": ["what's absent that would strengthen this resume"],
  "overall_weakness_flags": []
}`;

export const POST = withAuth(async (req, user) => {
  try {
    const { resumeText } = await req.json();

    if (!resumeText) {
      throw new AppError("Missing resume text", 400);
    }

    const models = ["google/gemini-2.5-flash-lite-preview-09-2025"];
    let response: any = null;
    let retries = 0;
    const maxRetries = 3;

    while (retries <= maxRetries) {
      const client = getRotatedClient();
      const model = models[retries % models.length];

      try {
        console.log(`[Extraction Layer] Starting parse with ${model} (Attempt ${retries + 1})`);
        response = await client.chat.completions.create({
          model: model,
          messages: [
            { role: "system", content: EXTRACTION_PROMPT },
            { role: "user", content: `INPUT: ${resumeText.substring(0, 15000)}` }
          ],
          temperature: 0.1, // Very low temperature for pure deterministic extraction
          max_tokens: 8000,
        });

        if (response?.choices?.[0]?.message?.content) {
          break; // Success
        } else {
          throw new Error("Empty response from AI");
        }
      } catch (e: any) {
        if (retries < maxRetries) {
          retries++;
          const waitTime = Math.min(8000, Math.pow(2, retries) * 1000);
          console.log(`[Extraction Layer] Error: ${e.message}. Retrying in ${waitTime/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          console.error("[Extraction Layer] Exhausted all retries:", e.message);
          throw new AppError("AI Extraction Engine failed. The provider is currently busy.", 500);
        }
      }
    }

    if (!response || !response.choices?.[0]?.message?.content) {
      throw new AppError("AI Extraction Engine returned an empty response.", 500);
    }

    const raw = response.choices[0].message.content;
    
    let extractedData;
    try {
      extractedData = extractJson(raw);
    } catch (parseErr) {
      console.error("[Extraction Layer] Failed to parse output:", raw.substring(0, 500));
      throw new AppError("AI Extraction Engine failed to structure the resume.", 500);
    }

    return NextResponse.json({
      success: true,
      extractedData
    });

  } catch (err: any) {
    console.error("[Extraction Layer] Error:", err);
    return NextResponse.json(
      { error: err.message || "Extraction failed." },
      { status: err.status || 500 }
    );
  }
});
