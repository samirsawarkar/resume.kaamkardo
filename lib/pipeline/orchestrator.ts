// ═══════════════════════════════════════════════════════════════
// lib/pipeline/orchestrator.ts
// The central brain of the resume optimization engine.
// Wires the 4 prompts, handles the retry loop, applies fixes,
// and yields progress events to the SSE router.
// ═══════════════════════════════════════════════════════════════

import { type ProgressEvent } from "./types";
import { runPrompt1 } from "./prompt1-jd-extractor";
import { runPrompt2 } from "./prompt2-gap-analyzer";
import { runPrompt3 } from "./prompt3-content-writer";
import { runPrompt4 } from "./prompt4-qa-auditor";
import { sanitizeResumeJSON } from "./sanitizer";
import { buildDocx } from "../renderer/docx-renderer";
import { buildPdf } from "../renderer/pdf-renderer";
import { normalizeJD, normalizeResume } from "./normalizer";
import { buildTruthRegistry } from "../core/truth-registry";
import { verifyAndCorrect } from "../core/integrity-verifier";

function progress(pct: number, message: string): ProgressEvent {
  return {
    step: pct < 20 ? 1 : pct < 50 ? 2 : pct < 70 ? 3 : pct < 90 ? 4 : 5,
    status: 'analyzing_jd' as any,
    progress: pct,
    message,
  };
}

export async function* runOptimizationPipeline(
  rawResume: string,
  rawJD: string,
  onProgress?: (event: ProgressEvent) => void
): AsyncGenerator<ProgressEvent> {

  // ── STEP 0: NORMALIZE ──────────────────────────────────────
  yield progress(5, 'Normalizing inputs...')
  const normalizedResume = await normalizeResume(rawResume)
  const normalizedJD = await normalizeJD(rawJD)

  // ── STEP 1: JD INTELLIGENCE ────────────────────────────────
  yield progress(15, 'Analyzing job requirements...')
  const jdIntel = await runPrompt1(normalizedJD.raw_text)

  // ── BUILD TRUTH REGISTRY (after step 1, before step 2) ─────
  // Registry is now locked. AI cannot violate it from here.
  const registry = buildTruthRegistry(normalizedResume, normalizedJD, jdIntel)
  yield progress(25, 'Requirements mapped. Building candidate profile...')

  // ── STEP 2: GAP ANALYSIS ───────────────────────────────────
  yield progress(40, 'Mapping your experience to requirements...')
  const gapAnalysis = await runPrompt2(jdIntel, normalizedResume as any, registry)

  // ── STEP 3: CONTENT WRITING ────────────────────────────────
  yield progress(60, 'Optimizing content for maximum ATS match...')
  let resumeJSON = await runPrompt3(jdIntel, gapAnalysis, normalizedResume as any, registry)

  // ── INTEGRITY CHECK (first pass) ──────────────────────────
  let { corrected, violations } = verifyAndCorrect(resumeJSON, registry)
  resumeJSON = corrected

  // ── STEP 4: QA AUDIT ───────────────────────────────────────
  yield progress(78, 'Running quality audit...')
  let audit = await runPrompt4(resumeJSON, registry)

  // ── RETRY (max once, non-auto-fixable blockers only) ───────
  const nonFixable = audit.blockers.filter(b => !b.is_auto_fixable)
  if (!audit.passed && nonFixable.length > 0) {
    yield progress(83, 'Fixing quality issues...')
    
    resumeJSON = await runPrompt3(
      jdIntel, gapAnalysis, normalizedResume as any, registry,
      `MANDATORY FIXES:\n${JSON.stringify(nonFixable)}`
    )

    // Integrity check again after retry
    const retry = verifyAndCorrect(resumeJSON, registry)
    resumeJSON = retry.corrected
    violations = [...violations, ...retry.violations]
    audit = await runPrompt4(resumeJSON, registry)
  }

  // ── SANITIZE (always runs, catches anything remaining) ─────
  resumeJSON = sanitizeResumeJSON(resumeJSON, jdIntel)

  // ── RENDER ─────────────────────────────────────────────────
  yield progress(92, 'Building your documents...')
  const docxBuffer = await buildDocx(resumeJSON)
  const pdfBuffer  = await buildPdf(resumeJSON)

  // ── DONE ───────────────────────────────────────────────────
  yield {
    step: 5, status: 'complete', progress: 100,
    message: `Optimization complete. ATS Score: ${audit.ats_score_validated}/100`,
    payload: {
      jdIntel, gapAnalysis, resumeJSON, audit,
      violations,
      registry: { currency: registry.currency, run_id: registry.run_id },
      docxBase64: docxBuffer.toString('base64'),
      pdfBase64:  pdfBuffer.toString('base64')
    } as any
  }
}
