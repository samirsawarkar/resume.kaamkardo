export interface ATSResult {
  score: number;
  grade: string;
  data_quality: {
    truncated: boolean;
    truncation_note: string | null;
    extraction_confidence: string;
  };
  domain: string;
  level: string;
  fit_roles: string[];
  jd_match?: {
    enabled: boolean;
    match_score: number | null;
    matched_keywords: string[];
    missing_keywords: string[];
  };
  salary: {
    current_projection: string;
    real_potential: string;
    gap_reason: string;
  };
  brutal_truth: string[];
  top_skills: string[];
  missing_skills: string[];
  quick_fixes: string[];
  section_scores: {
    keywords: number;
    achievements: number;
    formatting: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
  };
  score_audit: string;
  percentile?: number;
  total_submissions?: number;
  rewrites?: { original: string; rewritten: string }[];
}

export interface Job {
  id?: string;
  title: string;
  link: string;
  snippet?: string;
  company?: string;
  created_at?: string;
}

export interface KanbanState {
  applied: Job[];
  interviewing: Job[];
  offer: Job[];
}

export interface ParsedResumeData {
  score: number;
  targetRole: string;
  weaknesses: string[];
  strengths: string[];
  fit_roles?: string[];
  domain?: string;
  brutal_truth?: string[];
  top_skills?: string[];
}
