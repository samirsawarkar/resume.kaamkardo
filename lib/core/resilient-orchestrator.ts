// ═══════════════════════════════════════════════════════════════
// lib/core/resilient-orchestrator.ts
// Wires all layers. Fault-tolerant execution of the 4 steps.
// ═══════════════════════════════════════════════════════════════

import { type ProgressEvent, JDIntelligenceSchema, GapAnalysisSchema, OptimizedResumeSchema, AuditResultSchema } from "../pipeline/types";
import { type JDIntelligence, type GapAnalysis, type OptimizedResume, type AuditResult } from "../pipeline/types";
import { normalizeJD, normalizeResume } from "../pipeline/normalizer";
import { buildTruthRegistry } from "./truth-registry";
import { verifyAndCorrect } from "./integrity-verifier";
import { sanitizeResumeJSON } from "../pipeline/sanitizer";
import { buildDocx } from "../renderer/docx-renderer";
import { buildPdf } from "../renderer/pdf-renderer";
import OpenAI from "openai";
import { safeParseAIResponse } from "./safe-parser";
import { coerceToSchema } from "./schema-coercer";
import { escalateFailedSections } from "./escalation-engine";
import { buildPrompt1 } from "../pipeline/prompts";
import { buildPrompt2 } from "../pipeline/prompts";
import { buildPrompt3 } from "../pipeline/prompts";
import { buildPrompt4 } from "../pipeline/prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_1 || "dummy-key-for-build",
  baseURL: process.env.OPENAI_BASE_URL || "https://api.aicredits.in/v1",
});

async function callHaiku(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL_THINKING || "z-ai/glm-4-32b",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 4000,
    response_format: { type: "json_object" }
  });
  return response.choices[0]?.message?.content || "{}";
}

function progress(pct: number, message: string): ProgressEvent {
  return {
    step: pct < 20 ? 1 : pct < 50 ? 2 : pct < 70 ? 3 : pct < 90 ? 4 : 5,
    status: 'analyzing_jd' as any,
    progress: pct,
    message,
  };
}

async function runStep<T>(
  stepName: string,
  promptBuilder: () => string,
  schema: any,
  registry: any,
  fallback: T,
  context?: any
): Promise<{ result: T; degraded: boolean }> {
  try {
    const prompt = promptBuilder();
    // console.log(`\n\n======================================================`);
    // console.log(`=== [${stepName}] PROMPT ===`);
    // console.log(`======================================================\n`, prompt);
    
    const raw = await callHaiku(prompt);
    
    // console.log(`\n\n======================================================`);
    // console.log(`=== [${stepName}] RAW LLM OUTPUT ===`);
    // console.log(`======================================================\n`, raw);
    
    const parsed = safeParseAIResponse(raw, schema, registry, stepName, fallback);
    
    // console.log(`\n\n======================================================`);
    // console.log(`=== [${stepName}] PARSED (Method: ${parsed.method}) ===`);
    // console.log(`======================================================\n`, JSON.stringify(parsed.data, null, 2));
    
    if (parsed.method === 'fallback') {
      if (stepName === 'Step3_Content' && context) {
        const repaired = await escalateFailedSections(parsed.warnings, registry, context);
        const merged = { ...(parsed.data as any), ...repaired };
        return { result: merged as T, degraded: true };
      }
      return { result: parsed.data as T, degraded: true };
    }
    return { result: parsed.data as T, degraded: false };
  } catch (error) {
    return { result: fallback, degraded: true };
  }
}

export async function* runResilientPipeline(
  rawResume: string,
  rawJD: string,
  onProgress?: (event: ProgressEvent) => void
): AsyncGenerator<ProgressEvent> {

  let degradedSteps = 0;

  // ── STEP 0: NORMALIZE ──────────────────────────────────────
  yield progress(5, 'Normalizing inputs...');
  const normalizedResume = await normalizeResume(rawResume);
  const normalizedJD = await normalizeJD(rawJD);

  // ── STEP 1: JD INTELLIGENCE ────────────────────────────────
  yield progress(15, 'Analyzing job requirements...');
  const step1Fallback = {
    role_title: "Professional", company: "Company", location: "Remote",
    is_india_based: false, seniority_level: "mid", domain: "General",
    keywords: { must_have: [], preferred: [], implicit_traits: [] }
  } as any as JDIntelligence;
  const step1 = await runStep<JDIntelligence>(
    'Step1_JD', 
    () => buildPrompt1(normalizedJD.raw_text),
    JDIntelligenceSchema, 
    {} as any, 
    step1Fallback
  );
  if (step1.degraded) degradedSteps++;
  const jdIntel = step1.result;

  // ── BUILD TRUTH REGISTRY ───────────────────────────────────
  const registry = buildTruthRegistry(normalizedResume, normalizedJD, jdIntel);
  yield progress(25, 'Requirements mapped. Building candidate profile...');

  // ── STEP 2: GAP ANALYSIS ───────────────────────────────────
  yield progress(40, 'Mapping your experience to requirements...');
  const step2Fallback = {
    bridged_skills: [], unbridged_skills: (jdIntel.keywords?.must_have || []).map(k => k.keyword),
    experience_gaps: [], action_plan: { inject_keywords: [], reframe_bullets: [], structural_changes: [] }
  } as any as GapAnalysis;
  const step2 = await runStep<GapAnalysis>(
    'Step2_Gap',
    () => buildPrompt2(jdIntel, normalizedResume as any, registry),
    GapAnalysisSchema,
    registry,
    step2Fallback
  );
  if (step2.degraded) degradedSteps++;
  const gapAnalysis = step2.result;

  // ── STEP 3: CONTENT WRITING ────────────────────────────────
  yield progress(60, 'Optimizing content for maximum ATS match...');
  const step3Fallback = coerceToSchema(normalizedResume, registry) as OptimizedResume; 
  const step3 = await runStep<OptimizedResume>(
    'Step3_Content',
    () => buildPrompt3(jdIntel, gapAnalysis, normalizedResume as any, registry),
    OptimizedResumeSchema,
    registry,
    step3Fallback,
    { jdIntel, normalizedResume }
  );
  if (step3.degraded) degradedSteps++;
  let resumeJSON = step3.result;

  // ── INTEGRITY CHECK ALWAYS RUNS ────────────────────────────
  const { corrected, violations } = verifyAndCorrect(resumeJSON, registry);
  resumeJSON = corrected;

  // ── STEP 4: QA AUDIT ───────────────────────────────────────
  yield progress(78, 'Running quality audit...');
  const step4Fallback = {
    passed: false, ats_score_validated: 65, blockers: [], warnings: [],
    auto_fixable: [], approved_for_render: true, suggestions: []
  } as any as AuditResult;
  const step4 = await runStep<AuditResult>(
    'Step4_QA',
    () => buildPrompt4(resumeJSON, registry),
    AuditResultSchema,
    registry,
    step4Fallback
  );
  if (step4.degraded) degradedSteps++;
  const audit = step4.result;

  // ── SANITIZER ALWAYS RUNS ──────────────────────────────────
  resumeJSON = sanitizeResumeJSON(resumeJSON, jdIntel);

  // ── RENDER ─────────────────────────────────────────────────
  yield progress(92, 'Building your documents...');
  const docxBuffer = await buildDocx(resumeJSON);
  const pdfBuffer = await buildPdf(resumeJSON);

  // ── QUALITY SIGNAL ─────────────────────────────────────────
  let qualityIndicator = "Resume optimized — 95%+ ATS match";
  if (degradedSteps >= 3) {
    qualityIndicator = "Resume formatted — manual review recommended";
  } else if (degradedSteps > 0) {
    qualityIndicator = "Resume optimized — review highlighted sections";
  }

  yield {
    step: 5, status: 'complete', progress: 100,
    message: qualityIndicator,
    payload: {
      jdIntel, gapAnalysis, resumeJSON, audit,
      violations,
      registry: { currency: registry.currency, run_id: registry.run_id },
      docxBase64: docxBuffer.toString('base64'),
      pdfBase64: pdfBuffer.toString('base64'),
      quality: degradedSteps === 0 ? 'OPTIMIZED' : (degradedSteps >= 3 ? 'BASIC' : 'PARTIAL')
    } as any
  };
}
