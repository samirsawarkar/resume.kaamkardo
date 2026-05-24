import crypto from 'crypto';
import { JDIntelligence, NormalizedResumeType, NormalizedJDType } from '../pipeline/types';

export interface TruthRegistry {
  candidate: {
    name: string;
    email: string;
    phone: string;
    location: string;
    links: Record<string, any>;
  };
  legitimate_companies: string[];
  jd_company: string;
  original_metrics: Array<{
    value: string;
    context: string;
    type: 'percentage' | 'currency' | 'count' | 'ratio';
  }>;
  original_projects: Array<{
    name: string;
    tech_stack: string[];
    duration: string;
    original_bullets: string[];
  }>;
  original_skills: string[];
  currency: '₹' | '$' | '£' | '€';
  currency_lock_reason: string;
  jd: {
    must_have_keywords: Array<{ keyword: string; exact_spelling: string }>;
    preferred_keywords: Array<{ keyword: string; exact_spelling: string }>;
    hidden_keywords: string[];
    required_skills_verbatim: string[];
    education_requirement: string;
    action_verbs: string[];
  };
  run_id: string;
  created_at: string;
  source_resume_hash: string;
  jd_hash: string;
}

function detectMetricType(val: string): 'percentage' | 'currency' | 'count' | 'ratio' {
  if (val.includes('%')) return 'percentage';
  if (val.includes('₹') || val.includes('$') || val.includes('£') || val.includes('€')) return 'currency';
  if (val.includes(':') || val.includes('/')) return 'ratio';
  return 'count';
}

function md5(text: string): string {
  return crypto.createHash('md5').update(text).digest('hex');
}

export function buildTruthRegistry(
  normalizedResume: NormalizedResumeType,
  normalizedJD: NormalizedJDType,
  jdIntel: JDIntelligence
): TruthRegistry {

  const legitimate_companies = (normalizedResume.experience || [])
    .map(e => e.company)
    .filter(c => c && c !== 'Independent Project');

  const metricPattern = /(?:₹|\$|£|€)?\d+(?:,\d{3})*(?:\.\d+)?(?:K|M|L|Cr)?(?:\s*[-–]\s*(?:₹|\$|£|€)?\d+(?:,\d{3})*(?:\.\d+)?(?:K|M|L|Cr)?)?(?:\s*%)?/g;
  const all_text = JSON.stringify(normalizedResume);
  
  // Use a Set to avoid duplicate metrics from showing up multiple times
  const matches = [...all_text.matchAll(metricPattern)].map(m => m[0]);
  const uniqueMatches = Array.from(new Set(matches));
  
  const original_metrics = uniqueMatches.map(m => ({ 
    value: m, 
    context: '', 
    type: detectMetricType(m) 
  }));

  const indiaSignals = ['india', 'pune', 'mumbai', 'delhi', 'bangalore', 'bengaluru', 'hyderabad', 'chennai', 'kolkata', 'noida', 'gurgaon', 'ahmedabad'];
  const locationLower = normalizedJD.location.toLowerCase();
  const currency = indiaSignals.some(s => locationLower.includes(s)) ? '₹' : '$';

  return {
    candidate: {
      name: normalizedResume.header.name,
      email: normalizedResume.header.email,
      phone: normalizedResume.header.phone,
      location: normalizedResume.header.location,
      links: normalizedResume.header.links
    },
    legitimate_companies,
    jd_company: normalizedJD.company,
    original_metrics,
    original_projects: (normalizedResume.projects || []).map(p => ({
      name: p.name,
      tech_stack: p.tech_stack || [],
      duration: p.duration || "",
      original_bullets: p.bullets || []
    })),
    original_skills: normalizedResume.skills || [],
    currency,
    currency_lock_reason: `JD location: ${normalizedJD.location}`,
    jd: {
      must_have_keywords: (jdIntel.keywords?.must_have || []).map(k => ({
        keyword: k.keyword,
        exact_spelling: k.exact_spelling || k.keyword
      })),
      preferred_keywords: (jdIntel.keywords?.preferred || []).map(k => ({
        keyword: k.keyword,
        exact_spelling: k.exact_spelling || k.keyword
      })),
      hidden_keywords: (jdIntel.keywords?.hidden || []).map(h => h.keyword),
      required_skills_verbatim: (jdIntel.keywords?.must_have || []).map(k => k.exact_spelling || k.keyword),
      education_requirement: jdIntel.requirements?.education?.minimum || "",
      action_verbs: jdIntel.keywords?.action_verbs_jd_uses || []
    },
    run_id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    source_resume_hash: md5(JSON.stringify(normalizedResume)),
    jd_hash: md5(JSON.stringify(normalizedJD))
  };
}
