// ═══════════════════════════════════════════════════════════════
// lib/core/safe-parser.ts
// Single entry point for AI parsing. 4 attempts to parse cleanly.
// Never throws.
// ═══════════════════════════════════════════════════════════════

import { ZodSchema } from "zod";
import { TruthRegistry } from "./truth-registry";
import { rescueRawResponse } from "./response-rescue";
import { coerceToSchema } from "./schema-coercer";

export interface ParseResult<T> {
  success: boolean;
  data: T;
  method: 'direct' | 'rescued' | 'coerced' | 'fallback';
  warnings: string[];
  originalRaw: string;
}

export function safeParseAIResponse<T>(
  raw: string,
  schema: ZodSchema<T>,
  registry: TruthRegistry,
  stepName: string,
  fallback: T
): ParseResult<T> {
  
  let parsed: any = null;
  let rescued = raw;

  // ATTEMPT 1 — DIRECT PARSE
  try {
    parsed = JSON.parse(raw);
    const zodResult = schema.safeParse(parsed);
    if (zodResult.success) {
      return { success: true, data: zodResult.data, method: 'direct', warnings: [], originalRaw: raw };
    }
  } catch (e) {
    // move to attempt 2
  }

  // ATTEMPT 2 — RESCUED PARSE
  try {
    rescued = rescueRawResponse(raw);
    parsed = JSON.parse(rescued);
    const zodResult = schema.safeParse(parsed);
    if (zodResult.success) {
      return { success: true, data: zodResult.data, method: 'rescued', warnings: [], originalRaw: raw };
    }
  } catch (e) {
    // move to attempt 3
  }

  // ATTEMPT 3 — COERCED PARSE (Only for Step3_Content)
  try {
    if (stepName === 'Step3_Content' || stepName.startsWith('escalation-')) {
      if (!parsed) parsed = {};
      const coerced = stepName === 'Step3_Content' ? coerceToSchema(parsed, registry) : parsed;
      const zodResult = schema.safeParse(coerced);
      if (zodResult.success) {
        return { success: true, data: zodResult.data, method: 'coerced', warnings: [], originalRaw: raw };
      }
      parsed = coerced;
    }
  } catch (e) {
    // move to attempt 4
  }

  // ATTEMPT 4 — FIELD-BY-FIELD PARTIAL PARSE (FALLBACK)
  let finalFallback: any = fallback;
  if (stepName === 'Step3_Content') {
    try {
      if (!parsed) parsed = {};
      finalFallback = coerceToSchema(parsed, registry);
    } catch (err) {
      finalFallback = coerceToSchema({}, registry);
    }
  } else {
    // Merge valid keys from parsed onto fallback
    if (parsed && typeof parsed === 'object') {
      finalFallback = { ...fallback, ...parsed };
    }
  }

  // Gather warnings (which fields are completely missing/empty)
  const warnings: string[] = [];
  if (stepName === 'Step3_Content') {
    if (!finalFallback.experience || finalFallback.experience.length === 0) warnings.push('experience');
    if (!finalFallback.skills || finalFallback.skills.length === 0) warnings.push('skills');
    if (!finalFallback.projects || finalFallback.projects.length === 0) warnings.push('projects');
  }

  return {
    success: false,
    data: finalFallback as T,
    method: 'fallback',
    warnings,
    originalRaw: raw
  };
}
