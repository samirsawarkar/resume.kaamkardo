import { z } from "zod";

export const JDIntelligenceSchema = z.object({
  role_title: z.string().optional(),
  keywords: z.object({
    must_have: z.array(z.string()).optional().default([]),
    hidden: z.array(z.string()).optional().default([]),
  }).optional().default({ must_have: [], hidden: [] }),
  requirements: z.object({
    hard_requirements: z.array(z.string()).optional().default([]),
  }).optional().default({ hard_requirements: [] }),
  what_this_hiring_manager_fears: z.array(z.string()).optional().default([])
});

export const GapAnalysisSchema = z.object({
  keyword_coverage: z.object({
    missing_critical_keywords: z.array(z.string()).optional().default([]),
  }).optional().default({ missing_critical_keywords: [] }),
  hidden_strengths_to_surface: z.array(
    z.object({
      what_candidate_has: z.string().optional(),
      better_framing: z.string().optional(),
    })
  ).optional().default([]),
  rewrite_priority: z.array(z.string()).optional().default([])
});

export const ResumeMetaSummarySchema = z.object({
  meta: z.object({
    estimatedShortlistImprovement: z.string().optional(),
    atsBreakdown: z.record(z.string(), z.number()).optional().default({}),
    recruiterSignalsDetected: z.array(z.string()).optional().default([]),
    beforeAfterChanges: z.array(
      z.object({
        original: z.string().optional(),
        rewritten: z.string().optional(),
        reason: z.string().optional()
      })
    ).optional().default([])
  }).optional().default({ atsBreakdown: {}, recruiterSignalsDetected: [], beforeAfterChanges: [] }),
  header: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    links: z.array(z.string()).optional().default([])
  }).optional().default({ links: [] }),
  summary: z.string().optional()
});

export const ResumeSkillsSchema = z.object({
  skills: z.object({
    categories: z.record(z.string(), z.array(z.string())).optional().default({})
  }).optional().default({ categories: {} })
});

export const ResumeExperienceSchema = z.object({
  experience: z.array(
    z.object({
      role: z.string().optional(),
      company: z.string().optional(),
      duration: z.string().optional(),
      bullets: z.array(z.string()).optional().default([])
    })
  ).optional().default([])
});

export const ResumeProjectsEduSchema = z.object({
  education: z.array(z.any()).optional().default([]),
  projects: z.array(z.any()).optional().default([])
});

export const AuditSchema = z.object({
  passed: z.boolean().default(true),
  blockers: z.array(z.string()).optional().default([])
});
