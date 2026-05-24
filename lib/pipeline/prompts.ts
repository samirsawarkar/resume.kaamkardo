// ═══════════════════════════════════════════════════════════════
// lib/pipeline/prompts.ts
// The 4 system prompts governing the optimization engine.
// Each begins with the mandatory context isolation header.
// ═══════════════════════════════════════════════════════════════

import { JDIntelligence, GapAnalysis, OptimizedResume } from "./types";
import { TruthRegistry } from "../core/truth-registry";
import { NormalizedResumeType as NormalizedResume } from "./types";

export const UNIVERSAL_HEADER = `
ABSOLUTE OPERATING RULES — READ BEFORE EVERYTHING ELSE:

RULE A — OUTPUT FORMAT
Output ONLY valid raw JSON. Character 1 of your response must be 
the opening brace {. Zero preamble. Zero explanation. Zero markdown 
fences. Zero backticks. Zero trailing text after the closing brace.
If your response contains anything other than valid JSON, 
it is a complete failure regardless of content quality.

RULE B — INPUT/OUTPUT SEPARATION  
Everything provided under "CANDIDATE RESUME INPUT" and 
"JD INPUT" are source material for analysis only.
Source material text must NEVER appear verbatim in any output field.
The skills section must contain ONLY the candidate's actual skills.
The experience section must contain ONLY candidate's actual work.
Violation of this rule is a catastrophic failure.

RULE C — ZERO FABRICATION
Never invent, assume, or infer any fact not explicitly stated 
in the candidate's original resume.
This includes: company names, job titles, metrics, tools, 
technologies, achievements, dates, or any other information.
If information is missing, use the exact fallback specified.
Fabrication is grounds for complete output rejection.

RULE D — CURRENCY ENFORCEMENT
Check the JD location field. If it contains any Indian city 
or "India": every monetary value in every output field 
must use ₹. Never $ or £. Replace any $ or £ you encounter 
in the source resume with ₹ in your output.

RULE E — COMPLETENESS MANDATE
Every section present in the source resume must appear in output.
You may not drop, truncate, or omit any project, role, 
certification, or education entry from the source material.
If you are approaching output length limits, reduce bullet count 
per role to 3 — never eliminate an entire section or entry.
`;

export const CONTEXT_ISOLATION_HEADER = `
CRITICAL INPUT/OUTPUT SEPARATION:
Everything provided after "INPUT:" is source material for analysis only.
Source material text must NEVER appear verbatim in any output field.
The skills section must contain ONLY the candidate's actual skills.
The experience section must contain ONLY the candidate's actual work.
If any output field contains text copied from the JD input,
that is a catastrophic failure. Treat it as a BLOCKER.
Output ONLY valid JSON. Raw JSON starts at character 1.
Zero preamble. Zero explanation. Zero markdown fences. Zero backticks.
`;

// ── PROMPT 1 ─────────────────────────────────────────────────

export function buildPrompt1(rawJD: string): string {
  return UNIVERSAL_HEADER + CONTEXT_ISOLATION_HEADER + `

YOUR ROLE: Extract intelligence from the JD only.
Do not touch the resume. Extract. Nothing else.

HIDDEN KEYWORD DEPTH REQUIREMENT:
For every responsibility in the JD, extract 2 implied keywords
not explicitly stated. Minimum total hidden keywords: 10.
These hidden keywords are worth 8–12 ATS points.

JD INPUT:
${rawJD}

OUTPUT JSON:
{
  "role_title": "string",
  "company": "string",
  "location": "string",
  "is_india_based": boolean,
  "seniority_level": "junior|mid|senior|lead",
  "domain": "string",
  "keywords": {
    "must_have": [{
      "keyword": "string",
      "exact_spelling": "string",
      "frequency": number,
      "ats_weight": "high|medium|low"
    }],
    "preferred": [{
      "keyword": "string",
      "exact_spelling": "string",
      "ats_weight": "high|medium|low"
    }],
    "hidden": [{
      "keyword": "string",
      "implied_by": "string",
      "injection_location": "summary|skills|bullet"
    }],
    "tools_and_tech": [{
      "tool": "string",
      "exact_spelling": "string",
      "required_or_preferred": "required|preferred"
    }],
    "action_verbs_jd_uses": ["string"],
    "exact_phrases_to_mirror": ["string"]
  },
  "requirements": {
    "education": {
      "minimum": "string",
      "fields_accepted": ["string"]
    },
    "hard_requirements": ["string"],
    "soft_requirements": ["string"]
  },
  "scoring_matrix": {
    "highest_weight_sections": ["string"],
    "knockout_criteria": ["string"],
    "differentiators": ["string"]
  },
  "what_this_hiring_manager_fears": ["string"],
  "bonus_signals": ["string"]
}
`;
}

// ── PROMPT 2 ─────────────────────────────────────────────────

export function buildPrompt2(
  jdIntel: JDIntelligence,
  normalizedResume: NormalizedResume,
  registry: TruthRegistry
): string {
  return UNIVERSAL_HEADER + CONTEXT_ISOLATION_HEADER + `

YOUR ROLE: Map every JD requirement against every resume element.
Find matches, gaps, and hidden strengths.
Do not rewrite anything. Analyze only.

TRUTH REGISTRY CONSTRAINTS:
These facts are locked. Your analysis must respect them:
- Legitimate companies: ${JSON.stringify(registry.legitimate_companies)}
- Currency: ${registry.currency}
- All original projects exist: ${registry.original_projects.map((p: any) => p.name).join(', ')}
- All original skills exist: ${registry.original_skills.join(', ')}

JD INTELLIGENCE INPUT:
${JSON.stringify(jdIntel, null, 2)}

CANDIDATE RESUME INPUT:
${JSON.stringify(normalizedResume, null, 2)}

HIDDEN STRENGTH DETECTION RULE:
A hidden strength is when the candidate has a skill or achievement
that matches a JD requirement but is described using different language.
Example: candidate says "n8n workflow automation" — JD says 
"workflow automation" — this is a HIDDEN_STRENGTH not a gap.
Extract every hidden strength. Missing these costs ATS points.

OUTPUT JSON:
{
  "overall_match_score": {
    "current_score": number,
    "projected_score": number,
    "hard_ceiling": number
  },
  "keyword_coverage": {
    "must_have_matched": [{
      "keyword": "string",
      "evidence_in_resume": "string",
      "strength": "STRONG|PARTIAL|WEAK",
      "needs_surfacing": boolean
    }],
    "must_have_missing": [{
      "keyword": "string",
      "gap_type": "HARD_GAP|BRIDGEABLE|HIDDEN_STRENGTH",
      "bridge_strategy": "string | null",
      "hidden_strength_evidence": "string | null"
    }],
    "preferred_matched": [{ "keyword": "string", "evidence": "string" }],
    "preferred_missing": [{ "keyword": "string", "gap_type": "string" }],
    "hidden_keywords_coverable": ["string"]
  },
  "hidden_strengths_to_surface": [{
    "what_candidate_has": "string",
    "what_jd_calls_it": "string",
    "current_framing": "string",
    "better_framing": "string"
  }],
  "sections_audit": {
    "summary": { "quality": number, "missing_keywords": ["string"] },
    "skills": { "missing_critical": ["string"], "to_add": ["string"] },
    "experience": {
      "roles_with_blank_company": ["string"],
      "bullets_without_metrics": ["string"],
      "bullets_with_weak_verbs": ["string"]
    },
    "education": { "present": boolean, "matches_requirement": boolean },
    "projects": {
      "all_present": boolean,
      "missing_projects": ["string"]
    }
  },
  "data_integrity_flags": [{
    "flag": "string",
    "severity": "BLOCKER|WARNING|SUGGESTION",
    "location": "string",
    "fix": "string"
  }],
  "rewrite_priority_order": ["string"]
}
`;
}

// ── PROMPT 3 ─────────────────────────────────────────────────

export function buildPrompt3(
  jdIntel: JDIntelligence,
  gapAnalysis: GapAnalysis,
  normalizedResume: NormalizedResume,
  registry: TruthRegistry,
  fixInstructions?: string
): string {
  return UNIVERSAL_HEADER + CONTEXT_ISOLATION_HEADER + `

YOUR ROLE: Write optimized resume content.
You rewrite language and inject keywords.
You never change facts, invent information, or drop content.

════════════════════════════════════════════════
TRUTH REGISTRY — THESE ARE HARD CONSTRAINTS
YOU CANNOT VIOLATE THESE UNDER ANY CIRCUMSTANCE
════════════════════════════════════════════════

1. COMPANY WHITELIST (only these companies may appear in experience):
${registry.legitimate_companies.map((c: any) => `   • "${c}"`).join('\n')}
   • "Independent Project" (for any role without a company)
   
   FORBIDDEN COMPANY: "${registry.jd_company}"
   This is the company in the JD. The candidate does not work there.
   Never use this name as an employer. Not even close variants.

2. CURRENCY: ${registry.currency} — every monetary value uses this symbol.

3. PROJECTS THAT MUST APPEAR (all of these, no exceptions):
${registry.original_projects.map((p: any) => `   • "${p.name}" (${p.duration})`).join('\n')}
   If you are running low on tokens, reduce bullets per role to 3.
   Never drop a project entirely.

4. METRICS WHITELIST (use only these numbers — never invent new ones):
${registry.original_metrics.slice(0, 20).map((m: any) => `   • ${m.value}`).join('\n')}

5. CANDIDATE IDENTITY (never change these):
   Name: ${registry.candidate.name}
   Email: ${registry.candidate.email}
   Phone: ${registry.candidate.phone}

════════════════════════════════════════════════
KEYWORD INJECTION REQUIREMENTS
════════════════════════════════════════════════

MUST-HAVE KEYWORDS — all must appear in output (use exact spelling):
${registry.jd.must_have_keywords.map((k: any) => `• "${k.exact_spelling}"`).join('\n')}

HIDDEN KEYWORDS — inject naturally across summary and bullets:
${registry.jd.hidden_keywords.map((k: any) => `• "${k}"`).join('\n')}

JD ACTION VERBS — use these to start bullets where they fit:
${registry.jd.action_verbs.join(', ')}

════════════════════════════════════════════════
WRITING RULES
════════════════════════════════════════════════

BULLET FORMULA: [JD_VERB] + [WHAT] + [HOW/TOOL] + [METRIC]
BULLET MAX: 22 words. Hard limit.
BULLET MIN METRIC: every bullet needs a number, %, or ₹ value.
BULLETS PER ROLE: max 5. If tight on space: reduce to 3, never 0.
BULLET ORDER: highest quantified impact first within each role.

SUMMARY FORMULA (exactly 3 sentences, max 65 words total):
S1: [Role title from JD] with [N projects/experience] building 
    [specific output] for [domain].
S2: [Biggest metric achievement] using [JD keyword tool].
S3: Seeking to [JD verb] at [company] through [2 JD keywords].

SKILLS SECTION RULES:
Category order (ATS optimal):
1. "Analytics & Data Science"
2. "Forecasting & Optimization"  
3. "ERP & Data Platforms"
4. "Visualization & Reporting"
5. "Automation & Integration"
6. "Domain Knowledge"

Every must-have keyword appears in at least one category.
Skill names match JD exact_spelling exactly.
"Power BI" not "PowerBI". "SQL" not "SQL/MySQL".

${fixInstructions ? `
════════════════════════════════════════════════
MANDATORY FIXES FROM PREVIOUS RUN — FIX ALL:
════════════════════════════════════════════════
${fixInstructions}
` : ''}

════════════════════════════════════════════════
INPUT MATERIAL (source only — never copy verbatim to output)
════════════════════════════════════════════════

JD INTELLIGENCE:
${JSON.stringify(jdIntel, null, 2)}

GAP ANALYSIS:
${JSON.stringify(gapAnalysis, null, 2)}

CANDIDATE RESUME:
${JSON.stringify(normalizedResume, null, 2)}

OUTPUT THE COMPLETE OPTIMIZED RESUME JSON:
{
  "meta": {
    "ats_score_projected": number,
    "keyword_coverage_percent": number,
    "jd_role_targeted": "string",
    "inferred_metrics": [],
    "data_integrity_warnings": [],
    "hard_gaps_not_bridged": []
  },
  "header": {
    "name": "${registry.candidate.name}",
    "tagline": "string",
    "email": "${registry.candidate.email}",
    "phone": "${registry.candidate.phone}",
    "location": "${registry.candidate.location}",
    "links": { "github": null, "linkedin": null, "portfolio": null }
  },
  "summary": "string",
  "skills": [{ "category": "string", "items": ["string"] }],
  "experience": [{
    "role": "string",
    "company": "string",
    "duration": "string",
    "location": "string",
    "subtitle": "string",
    "bullets": ["string"]
  }],
  "projects": [{
    "name": "string",
    "subtitle": "string",
    "duration": "string",
    "bullets": ["string"]
  }],
  "open_source": [{ "name": "string", "subtitle": "string", "duration": "string", "bullets": ["string"] }],
  "publications": [{ "title": "string", "venue": "string", "year": "string", "doi_or_url": "string", "one_line": "string" }],
  "education": [{
    "degree": "string",
    "institution": "string",
    "location": "string",
    "year": "string",
    "score": "string",
    "relevant_courses": "string"
  }],
  "certifications": [{ "name": "string", "issuer": "string", "year": "string" }],
  "languages": ["string"],
  "metrics_bar": [{ "value": "string", "label": "string" }]
}
`;
}

// ── PROMPT 4 ─────────────────────────────────────────────────

export function buildPrompt4(
  resumeJSON: OptimizedResume,
  registry: TruthRegistry
): string {
  return UNIVERSAL_HEADER + CONTEXT_ISOLATION_HEADER + `

YOUR ROLE: Hostile ATS auditor. Find every flaw.
You are not the writer. You are the critic.
Check every rule. Miss nothing.

TRUTH REGISTRY FOR VERIFICATION:
Legitimate companies: ${JSON.stringify(registry.legitimate_companies)}
Forbidden company: "${registry.jd_company}"
Required projects: ${registry.original_projects.map((p: any) => p.name).join(', ')}
Required currency: ${registry.currency}
Required skills (exact spelling): 
${registry.jd.required_skills_verbatim.join(', ')}

RESUME TO AUDIT:
${JSON.stringify(resumeJSON, null, 2)}

CHECK EVERY ITEM — BLOCKERS PREVENT RENDER:

BLOCKER CHECKS:
□ experience[*].company is never "${registry.jd_company}"
□ experience[*].company is never blank or empty string
□ experience[*].company is in legitimate companies list 
  OR equals "Independent Project"
□ skills section has minimum 5 categories
□ skills section has minimum 3 items per category
□ every required skill appears in skills section with exact spelling
□ education section has minimum 1 complete entry
□ summary is present, 20–65 words
□ no bullet exceeds 22 words
□ all monetary values use ${registry.currency}
□ header.name equals "${registry.candidate.name}"
□ header.email equals "${registry.candidate.email}"
□ no skills item contains # or ## or --- or * characters
□ all projects from required list are present in output
□ no field contains JD text markers (##, ---, ## Company)

WARNING CHECKS:
□ any bullet without a metric
□ any bullet starting with a pronoun
□ any keyword appearing more than 4 times (stuffing)
□ any project with fewer than 3 bullets
□ metrics_bar has fewer than 4 entries
□ publications section missing despite research work in resume
□ open_source section missing despite OSS work in resume

OUTPUT JSON:
{
  "passed": boolean,
  "ats_score_validated": number,
  "blockers": [{
    "rule": "string",
    "location": "string",
    "current_value": "string",
    "required_fix": "string",
    "is_auto_fixable": boolean
  }],
  "warnings": [{
    "rule": "string",
    "location": "string",
    "suggested_fix": "string"
  }],
  "auto_fixable": [{
    "location": "string",
    "current": "string",
    "fix": "string"
  }],
  "approved_for_render": boolean
}
`;
}
