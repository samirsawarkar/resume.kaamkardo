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
  
  const key = (requestCount % 2 === 0 && key2) ? key2 : (key1 || "sk-live-b5e4c685089f9658422e5cf9f734074c9eaa7311f1e911eacfb713827211f6c5");
  
  return new OpenAI({
    apiKey: key,
    baseURL: baseUrl,
  });
}

const VALIDATION_PROMPT = `ROLE: You are a hostile ATS expert reviewing an optimized resume JSON for errors. 
Your job is to find every flaw before it reaches the user.

Check the optimized resume JSON for:
1. Any bullet over 20 words → flag with location
2. Any bullet without a verb → flag
3. Any metric that seems fabricated or implausible → flag as SUSPICIOUS
4. Any keyword that appears more than 3 times (stuffing) → flag
5. Summary over 3 sentences → flag
6. Any section heading that's non-standard (ATS won't recognize) → flag
7. Skills listed in experience that don't appear in skills section → flag as INCONSISTENT

OUTPUT ONLY VALID JSON:
{
  "passed": boolean,
  "issues": [{ "location": "", "issue": "", "severity": "BLOCK|WARN|SUGGEST" }],
  "auto_fixable": [{ "location": "", "fix": "" }]
}`;

export const POST = withAuth(async (req, user) => {
  try {
    const { optimizedResumeJson } = await req.json();

    if (!optimizedResumeJson) {
      throw new AppError("Missing optimized resume JSON", 400);
    }

    const models = ["google/gemini-2.5-flash-lite-preview-09-2025"];
    let response: any = null;
    let retries = 0;
    const maxRetries = 3;

    while (retries <= maxRetries) {
      const client = getRotatedClient();
      const model = models[retries % models.length];

      try {
        console.log(`[Validation Layer] Running Quality Checker with ${model} (Attempt ${retries + 1})`);
        response = await client.chat.completions.create({
          model: model,
          messages: [
            { role: "system", content: VALIDATION_PROMPT },
            { role: "user", content: `OPTIMIZED RESUME JSON:\n${JSON.stringify(optimizedResumeJson).substring(0, 15000)}` }
          ],
          temperature: 0.1,
          max_tokens: 4000,
        });

        if (response?.choices?.[0]?.message?.content) break;
        throw new Error("Empty response");
      } catch (e: any) {
        if (retries < maxRetries) {
          retries++;
          const waitTime = Math.min(8000, Math.pow(2, retries) * 1000);
          console.log(`[Validation Layer] Error: ${e.message}. Retrying in ${waitTime/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw new AppError("Validation Engine failed after retries.", 500);
        }
      }
    }

    const raw = response.choices[0].message.content;
    const validationResult = extractJson(raw);

    return NextResponse.json({
      success: true,
      validation: validationResult
    });

  } catch (err: any) {
    console.error("[Validation Layer] Error:", err);
    return NextResponse.json(
      { error: err.message || "Validation failed." },
      { status: err.status || 500 }
    );
  }
});
