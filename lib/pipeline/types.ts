// ═══════════════════════════════════════════════════════════════
// lib/pipeline/types.ts
// Complete type definitions and Zod validation schemas for
// the 4-prompt resume optimization pipeline.
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";

// ────────────────────────────────────────────────────────────────
// NORMALIZATION LAYER SCHEMAS
// ────────────────────────────────────────────────────────────────

export const NormalizedResumeSchema = z.object({
  header: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    links: z.record(z.string(), z.string()).catch({}),
  }),
  experience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    duration: z.string(),
    location: z.string(),
    bullets: z.array(z.string()),
  })),
  projects: z.array(z.object({
    name: z.string(),
    tech_stack: z.array(z.string()),
    duration: z.string(),
    bullets: z.array(z.string()),
  })),
  skills: z.array(z.string()),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.string(),
  })),
});
export type NormalizedResumeType = z.infer<typeof NormalizedResumeSchema>;

export const NormalizedJDSchema = z.object({
  company: z.string(),
  location: z.string(),
  role: z.string(),
  raw_text: z.string(),
});
export type NormalizedJDType = z.infer<typeof NormalizedJDSchema>;

// ────────────────────────────────────────────────────────────────
// PROMPT 1 OUTPUT — JD Intelligence
// ────────────────────────────────────────────────────────────────

export const JDKeywordSchema = z.object({
  keyword: z.string(),
  exact_spelling: z.string(),
  frequency: z.number(),
  context: z.string(),
  ats_weight: z.string(),
});
export type JDKeyword = z.infer<typeof JDKeywordSchema>;

export const JDIntelligenceSchema = z.object({
  role_title: z.string(),
  company: z.string(),
  location: z.string(),
  is_india_based: z.boolean(),
  seniority_level: z.enum(["junior", "mid", "senior", "lead"]),
  domain: z.string(),
  keywords: z.object({
    must_have: z.array(JDKeywordSchema),
    preferred: z.array(JDKeywordSchema),
    hidden: z.array(
      z.object({
        keyword: z.string(),
        implied_by: z.string(),
        injection_location: z.string(),
      })
    ),
    tools_and_tech: z.array(
      z.object({
        tool: z.string(),
        exact_spelling: z.string(),
        required_or_preferred: z.string(),
      })
    ),
    action_verbs_jd_uses: z.array(z.string()),
    exact_phrases_to_mirror: z.array(z.string()),
  }),
  requirements: z.object({
    education: z.object({
      minimum: z.string().nullable(),
      fields_accepted: z.array(z.string()),
    }),
    hard_requirements: z.array(z.string()),
    soft_requirements: z.array(z.string()),
  }),
  scoring_matrix: z.object({
    highest_weight_sections: z.array(z.string()),
    knockout_criteria: z.array(z.string()),
    differentiators: z.array(z.string()),
  }),
  what_this_hiring_manager_fears: z.array(z.string()),
  bonus_signals: z.array(z.string()),
});
export type JDIntelligence = z.infer<typeof JDIntelligenceSchema>;

// ────────────────────────────────────────────────────────────────
// PROMPT 2 OUTPUT — Gap Analysis
// ────────────────────────────────────────────────────────────────

export const GapAnalysisSchema = z.object({
  overall_match_score: z.object({
    current_score: z.number(),
    projected_score: z.number(),
    hard_ceiling: z.number(),
  }),
  keyword_coverage: z.object({
    must_have_matched: z.array(
      z.object({
        keyword: z.string(),
        evidence_in_resume: z.string(),
        strength: z.string(),
        needs_surfacing: z.boolean(),
      })
    ),
    must_have_missing: z.array(
      z.object({
        keyword: z.string(),
        gap_type: z.string(),
        bridge_strategy: z.string().nullable(),
        hidden_strength_evidence: z.string().nullable(),
      })
    ),
    preferred_matched: z.array(
      z.object({
        keyword: z.string(),
        evidence: z.string(),
      })
    ),
    preferred_missing: z.array(
      z.object({
        keyword: z.string(),
        gap_type: z.string(),
      })
    ),
    hidden_keywords_coverable: z.array(z.string()),
  }),
  hidden_strengths_to_surface: z.array(
    z.object({
      what_candidate_has: z.string(),
      what_jd_calls_it: z.string(),
      current_framing: z.string(),
      better_framing: z.string(),
    })
  ),
  sections_audit: z.object({
    summary: z.object({
      quality: z.number(),
      missing_keywords: z.array(z.string()),
    }),
    skills: z.object({
      missing_critical: z.array(z.string()),
      to_add: z.array(z.string()),
    }),
    experience: z.object({
      roles_with_blank_company: z.array(z.string()),
      bullets_without_metrics: z.array(z.string()),
      bullets_with_weak_verbs: z.array(z.string()),
    }),
    education: z.object({
      present: z.boolean(),
      matches_requirement: z.boolean(),
    }),
    projects: z.object({
      all_present: z.boolean(),
      missing_projects: z.array(z.string()),
    })
  }),
  data_integrity_flags: z.array(
    z.object({
      flag: z.string(),
      severity: z.string(),
      location: z.string(),
      fix: z.string(),
    })
  ),
  rewrite_priority_order: z.array(z.string()),
});
export type GapAnalysis = z.infer<typeof GapAnalysisSchema>;

// ────────────────────────────────────────────────────────────────
// PROMPT 3 OUTPUT — Optimized Resume
// ────────────────────────────────────────────────────────────────

export const OptimizedResumeSchema = z.object({
  meta: z.object({
    ats_score_projected: z.number(),
    keyword_coverage_percent: z.number(),
    jd_role_targeted: z.string(),
    optimization_date: z.string(),
    inferred_metrics: z.array(
      z.object({
        location: z.string(),
        original: z.string(),
        inferred: z.string(),
        confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
      })
    ),
    data_integrity_warnings: z.array(z.string()),
    hard_gaps_not_bridged: z.array(z.string()),
  }),
  header: z.object({
    name: z.string(),
    tagline: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    links: z.object({
      github: z.string().nullable(),
      linkedin: z.string().nullable(),
      portfolio: z.string().nullable(),
      publication: z.string().nullable(),
    }),
  }),
  summary: z.string(),
  skills: z.array(
    z.object({
      category: z.string(),
      items: z.array(z.string()),
    })
  ),
  experience: z.array(
    z.object({
      role: z.string(),
      company: z.string(),
      duration: z.string(),
      location: z.string(),
      subtitle: z.string(),
      bullets: z.array(z.string()),
    })
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      subtitle: z.string(),
      duration: z.string(),
      bullets: z.array(z.string()),
    })
  ),
  open_source: z.array(
    z.object({
      name: z.string(),
      subtitle: z.string(),
      duration: z.string(),
      bullets: z.array(z.string()),
    })
  ),
  publications: z.array(
    z.object({
      title: z.string(),
      venue: z.string(),
      year: z.string(),
      doi_or_url: z.string(),
      one_line: z.string(),
    })
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      location: z.string(),
      year: z.string(),
      score: z.string(),
      relevant_courses: z.string(),
    })
  ),
  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string(),
      year: z.string(),
    })
  ),
  languages: z.array(z.string()),
  metrics_bar: z.array(
    z.object({
      value: z.string(),
      label: z.string(),
    })
  ).optional().catch([]),
});
export type OptimizedResume = z.infer<typeof OptimizedResumeSchema>;

// ────────────────────────────────────────────────────────────────
// PROMPT 4 OUTPUT — Audit Result
// ────────────────────────────────────────────────────────────────

export const AuditResultSchema = z.object({
  passed: z.boolean(),
  ats_score_validated: z.number(),
  blockers: z.array(
    z.object({
      rule: z.string(),
      location: z.string(),
      current_value: z.string(),
      required_fix: z.string(),
      is_auto_fixable: z.boolean().catch(false),
    })
  ),
  warnings: z.array(
    z.object({
      rule: z.string(),
      location: z.string(),
      suggested_fix: z.string(),
    })
  ),
  suggestions: z.array(z.string()),
  auto_fixable: z.array(
    z.object({
      location: z.string(),
      current: z.string(),
      fix: z.string(),
    })
  ),
  approved_for_render: z.boolean(),
});
export type AuditResult = z.infer<typeof AuditResultSchema>;

// ────────────────────────────────────────────────────────────────
// PIPELINE STATE
// ────────────────────────────────────────────────────────────────

export interface PipelineState {
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  jdIntel: JDIntelligence;
  gapAnalysis: GapAnalysis;
  resumeJSON: OptimizedResume;
  audit: AuditResult;
  retryCount: number;
  errors: PipelineError[];
  docxBase64?: string;
  pdfBase64?: string;
}

export interface PipelineError {
  step: 1 | 2 | 3 | 4;
  type: "JSON_PARSE" | "ZOD_VALIDATION" | "API_ERROR" | "TIMEOUT";
  raw_response: string;
  error_message: string;
  timestamp: string;
}

// ────────────────────────────────────────────────────────────────
// SSE PROGRESS EVENTS
// ────────────────────────────────────────────────────────────────

export type ProgressStatus =
  | "extracting"
  | "analyzing_jd"
  | "finding_gaps"
  | "optimizing_content"
  | "quality_check"
  | "verifying_integrity"
  | "rendering"
  | "complete"
  | "retry"
  | "error";

export interface ProgressEvent {
  step: 1 | 2 | 3 | 4 | 5;
  status: ProgressStatus;
  progress: number;
  message: string;
  payload?: Partial<PipelineState> & { error?: string };
}

// ────────────────────────────────────────────────────────────────
// UTILITY: Safe parse helper
// Wraps Zod validation + JSON.parse into one call.
// Returns a discriminated union so callers never swallow errors.
// ────────────────────────────────────────────────────────────────

export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: PipelineError };

/**
 * Attempts JSON.parse then Zod validation.
 * On any failure, returns a structured PipelineError
 * with the raw response preserved for debugging.
 */
export function safeParse<T>(
  rawResponse: string,
  schema: z.ZodType<T>,
  step: PipelineError["step"]
): ParseResult<T> {
  // Step 1: Strip markdown fences and preamble if model leaked them
  let cleaned = rawResponse.trim();

  // Remove ```json ... ``` wrappers
  const fenceMatch = cleaned.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // Remove any leading non-JSON text before the first {
  const firstBrace = cleaned.indexOf("{");
  if (firstBrace > 0) {
    cleaned = cleaned.slice(firstBrace);
  }

  // Remove any trailing non-JSON text after the balanced closing }
  const lastBrace = findBalancedClosingBrace(cleaned);
  if (lastBrace !== -1 && lastBrace < cleaned.length - 1) {
    cleaned = cleaned.slice(0, lastBrace + 1);
  }

  // Step 2: JSON.parse
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (jsonErr) {
    return {
      success: false,
      error: {
        step,
        type: "JSON_PARSE",
        raw_response: rawResponse.slice(0, 2000), // Cap log size
        error_message: `JSON.parse() failed: ${(jsonErr as Error).message}`,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Step 3: Zod validation
  const zodResult = schema.safeParse(parsed);
  if (!zodResult.success) {
    // Build a human-readable error listing
    const issues = zodResult.error.issues
      .map((iss) => `  ${iss.path.join(".")}: ${iss.message}`)
      .join("\n");

    return {
      success: false,
      error: {
        step,
        type: "ZOD_VALIDATION",
        raw_response: rawResponse.slice(0, 2000),
        error_message: `Zod validation failed:\n${issues}`,
        timestamp: new Date().toISOString(),
      },
    };
  }

  return { success: true, data: zodResult.data };
}

/**
 * Finds the index of the closing brace that balances the first opening brace.
 * Handles nested objects and strings (respects escaped quotes).
 * Returns -1 if no balanced brace is found.
 */
function findBalancedClosingBrace(str: string): number {
  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (ch === "\\") {
      escapeNext = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }

  return -1;
}
