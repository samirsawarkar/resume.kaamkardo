import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import crypto from "crypto";
import { withAuth } from "@/src/lib/auth-guard";
import { env } from "@/src/config/env";
import { AppError } from "@/src/lib/errors";
import { createClient } from "@supabase/supabase-js";
import { extractJson } from "@/src/lib/json-extractor";

// TODO: Create a proper database client for server environments
function getSupabaseAdmin() {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase credentials missing. DB saves will fail.");
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

function getRotatedClient() {
  return new OpenAI({
    apiKey: "sk-live-44a8f2d0f9008c34cb38ec5d9849254d585aff0c11252d6f33fea291fb2b2508",
    baseURL: "https://api.aicredits.in/v1",
  });
}

function buildPhase1Prompt(resumeText: string, jdText: string) {
  return `You are an elite Recruiter Intent Engine.
Analyze this Resume against this Job Description.

JOB DESCRIPTION:
${jdText.slice(0, 3000)}

RESUME:
${resumeText.slice(0, 6000)}

Output ONLY raw JSON in this exact structure (no markdown):
{
  "recruiterSignalsDetected": ["3-5 underlying cultural/soft-skill traits the JD implies, e.g. 'startup mentality'"],
  "priorityKeywords": ["5-8 critical hard skills/tools required"],
  "weakSections": ["Which parts of the resume are misaligned?"],
  "jdIntentSummary": "1 sentence summarizing the core problem this hire solves."
}`;
}

function buildPhase2Prompt(resumeText: string, analysisJson: string) {
  return `You are an elite Resume Strategist.
Given the original resume and the Recruiter Analysis, determine exactly which bullet points must be rewritten. Do not rewrite them yet, just identify them.

ANALYSIS:
${analysisJson}

RESUME:
${resumeText.slice(0, 6000)}

Output ONLY raw JSON in this exact structure (no markdown):
{
  "bulletsToRewrite": [
    "exact bullet text from the resume"
  ],
  "estimatedShortlistImprovement": "e.g., 'Current: Weak -> Optimized: Strong'"
}`;
}

function buildPhase3Prompt(resumeText: string, strategyJson: string) {
  return `You are an elite Resume Writer.
You are rewriting specific bullet points to align with the recruiter intent.

RULES:
1. NEVER invent metrics, tools, or experience.
2. Improve wording, emphasize relevance, and compress.
3. Be boring, professional, and factual.

STRATEGY:
${strategyJson}

RESUME:
${resumeText.slice(0, 6000)}

Output ONLY raw JSON in this exact structure (no markdown):
{
  "beforeAfterChanges": [
    {
      "original": "exact original bullet",
      "rewritten": "the optimized bullet",
      "reason": "why this is better for ATS/Recruiter"
    }
  ],
  "atsBreakdown": {
    "Keyword Coverage": 85,
    "Semantic Alignment": 90,
    "Recruiter Readability": 95,
    "Experience Relevance": 80,
    "Skill Match": 88
  },
  "fullOptimizedText": "The complete rewritten resume text (plain text formatting)"
}`;
}

export const POST = withAuth(async (req, user) => {
  try {
    const { resumeText, jdText, targetCompany, targetRole } = await req.json();

    if (!resumeText || !jdText) {
      throw new AppError("Missing resume or JD text", 400);
    }

    // 1. Hash JD to detect duplicates / save tokens
    const jdHash = crypto.createHash("sha256").update(jdText.trim()).digest("hex");
    
    // TODO: We could check if `optimized_resumes` already has this hash for this user 
    // and return it immediately to save AI tokens.

    const client = getRotatedClient();

    // PHASE 1: Analysis (cheaper model could be used here)
    const phase1Res = await client.chat.completions.create({
      model: "z-ai/glm-4.7-flash",
      messages: [{ role: "user", content: buildPhase1Prompt(resumeText, jdText) }],
      temperature: 0.2
    });
    const analysisJson = phase1Res.choices[0].message.content || "{}";

    // PHASE 2: Strategy
    const phase2Res = await client.chat.completions.create({
      model: "z-ai/glm-4.7-flash",
      messages: [{ role: "user", content: buildPhase2Prompt(resumeText, analysisJson) }],
      temperature: 0.2
    });
    const strategyJson = phase2Res.choices[0].message.content || "{}";

    // PHASE 3: Generation
    const phase3Res = await client.chat.completions.create({
      model: "z-ai/glm-4.7-flash", // Ideally a stronger model here in production
      messages: [{ role: "user", content: buildPhase3Prompt(resumeText, strategyJson) }],
      temperature: 0.2
    });
    const generationJson = phase3Res.choices[0].message.content || "{}";

    // Combine results
    const parsedAnalysis = extractJson(analysisJson);
    const parsedStrategy = extractJson(strategyJson);
    const parsedGeneration = extractJson(generationJson);

    const finalResult = {
      recruiterSignalsDetected: parsedAnalysis.recruiterSignalsDetected || [],
      priorityKeywords: parsedAnalysis.priorityKeywords || [],
      weakSections: parsedAnalysis.weakSections || [],
      jdIntentSummary: parsedAnalysis.jdIntentSummary || "",
      estimatedShortlistImprovement: parsedStrategy.estimatedShortlistImprovement || "Current: Moderate -> Optimized: Strong",
      beforeAfterChanges: parsedGeneration.beforeAfterChanges || [],
      atsBreakdown: parsedGeneration.atsBreakdown || {},
      optimizedResumeContent: parsedGeneration.fullOptimizedText || ""
    };

    // Save to Database
    const supabase = getSupabaseAdmin();
    let inserted = null;
    if (supabase) {
      const { data, error: dbError } = await supabase
        .from('optimized_resumes')
        .insert({
          user_id: user.id,
          target_company: targetCompany || "Unknown",
          target_role: targetRole || "Target Role",
          jd_hash: jdHash,
          jd_text: jdText,
          ai_raw_json: finalResult,
          rendered_resume_text: finalResult.optimizedResumeContent,
          ats_breakdown_json: finalResult.atsBreakdown
        })
        .select()
        .single();
        
      inserted = data;
      if (dbError) {
        console.error("Failed to save optimized resume:", dbError);
      }
    }

    return NextResponse.json({
      success: true,
      result: finalResult,
      resumeId: inserted?.id
    });

  } catch (err: any) {
    console.error("Optimization pipeline failed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to optimize resume." },
      { status: err.status || 500 }
    );
  }
});
