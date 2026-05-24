// lib/core/integrity-verifier.ts

import { OptimizedResume } from "../pipeline/types";
import { TruthRegistry } from "./truth-registry";

export interface Violation {
  type: ViolationType;
  location: string;
  found: string;
  expected: string;
  auto_corrected: boolean;
  correction_applied: string;
}

export type ViolationType = 
  | 'FABRICATED_COMPANY'
  | 'JD_COMPANY_AS_EMPLOYER'
  | 'DROPPED_PROJECT'
  | 'WRONG_CURRENCY'
  | 'INVENTED_METRIC'
  | 'JD_TEXT_CONTAMINATION'
  | 'MISSING_REQUIRED_KEYWORD'
  | 'MISSING_REQUIRED_SKILL'
  | 'BLANK_FIELD'
  | 'BULLET_TOO_LONG'
  | 'EMPTY_SECTION';

function findBestSkillCategory(
  categories: { category: string; items: string[] }[],
  skill: string
): { category: string; items: string[] } | undefined {
  if (categories.length === 0) return undefined;
  
  const lowerSkill = skill.toLowerCase();
  if (lowerSkill.includes('cloud') || lowerSkill.includes('aws') || lowerSkill.includes('azure')) {
    return categories.find(c => c.category.toLowerCase().includes('cloud') || c.category.toLowerCase().includes('infrastructure'));
  }
  if (lowerSkill.includes('sql') || lowerSkill.includes('database') || lowerSkill.includes('mongo')) {
    return categories.find(c => c.category.toLowerCase().includes('database') || c.category.toLowerCase().includes('data'));
  }
  
  // Return first category as fallback
  return categories[0];
}

export function verifyAndCorrect(
  resumeJSON: OptimizedResume,
  registry: TruthRegistry
): { corrected: OptimizedResume; violations: Violation[] } {

  const violations: Violation[] = [];
  const result = JSON.parse(JSON.stringify(resumeJSON)) as OptimizedResume;

  // ── CHECK 1: FABRICATED OR JD COMPANY IN EXPERIENCE ────────
  for (let i = 0; i < result.experience.length; i++) {
    const exp = result.experience[i];
    const companyLower = exp.company?.toLowerCase() ?? '';
    const jdCompanyLower = registry.jd_company.toLowerCase();

    // Is this the JD company appearing as employer?
    if (companyLower.includes(jdCompanyLower) && jdCompanyLower.length > 2) {
      const isLegitimate = registry.legitimate_companies
        .some(c => c.toLowerCase().includes(jdCompanyLower));

      if (!isLegitimate) {
        violations.push({
          type: 'JD_COMPANY_AS_EMPLOYER',
          location: `experience[${i}].company`,
          found: exp.company,
          expected: 'Independent Project',
          auto_corrected: true,
          correction_applied: 'Replaced with Independent Project'
        });
        result.experience[i].company = 'Independent Project';
      }
    }

    // Is this a company not in the legitimate list?
    const isKnownCompany = registry.legitimate_companies
      .some(c => c.toLowerCase() === (result.experience[i].company?.toLowerCase() ?? ''));
    const isAllowedFallback = ['independent project', 'freelance', 'self-employed']
      .includes(result.experience[i].company?.toLowerCase() ?? '');

    if (!isKnownCompany && !isAllowedFallback && result.experience[i].company) {
      violations.push({
        type: 'FABRICATED_COMPANY',
        location: `experience[${i}].company`,
        found: result.experience[i].company,
        expected: 'Independent Project',
        auto_corrected: true,
        correction_applied: 'Replaced with Independent Project'
      });
      result.experience[i].company = 'Independent Project';
    }
  }

  // ── CHECK 2: DROPPED PROJECTS ───────────────────────────────
  for (const originalProject of registry.original_projects) {
    const found = result.projects.some(p =>
      p.name.toLowerCase().includes(
        originalProject.name.toLowerCase().slice(0, 15)
      )
    );

    if (!found) {
      violations.push({
        type: 'DROPPED_PROJECT',
        location: 'projects[]',
        found: 'missing',
        expected: originalProject.name,
        auto_corrected: true,
        correction_applied: 'Restored from original resume'
      });
      // Restore project from registry
      result.projects.push({
        name: originalProject.name,
        subtitle: originalProject.tech_stack.join(' · '),
        duration: originalProject.duration,
        bullets: originalProject.original_bullets.slice(0, 3)
      });
    }
  }

  // ── CHECK 3: WRONG CURRENCY ─────────────────────────────────
  const wrongCurrency = registry.currency === '₹' ? /\$|£/g : null;

  if (wrongCurrency) {
    const fixCurrency = (text: string) => text ? text.replace(wrongCurrency, '₹') : text;

    result.summary = fixCurrency(result.summary);

    result.experience = (result.experience || []).map(exp => ({
      ...exp,
      bullets: (exp.bullets || []).map(fixCurrency)
    }));

    result.projects = (result.projects || []).map(p => ({
      ...p,
      bullets: (p.bullets || []).map(fixCurrency)
    }));

    if (JSON.stringify(resumeJSON) !== JSON.stringify(result)) {
      violations.push({
        type: 'WRONG_CURRENCY',
        location: 'multiple fields',
        found: '$',
        expected: '₹',
        auto_corrected: true,
        correction_applied: 'All $ replaced with ₹'
      });
    }
  }

  // ── CHECK 4: JD TEXT CONTAMINATION ──────────────────────────
  const jdContaminationMarkers = [
    '## Company', '## Role', '## Job Description',
    '## Responsibilities', '## Required Skills',
    '## Preferred Skills', '## Qualifications',
    '## What We Look For', '## Bonus Points',
    '---\n', 'Pvt. Ltd.'
  ];

  const checkField = (value: string, location: string) => {
    if (typeof value !== 'string') return value;
    for (const marker of jdContaminationMarkers) {
      if (value.includes(marker)) {
        violations.push({
          type: 'JD_TEXT_CONTAMINATION',
          location,
          found: value.slice(0, 50),
          expected: 'Clean content without JD text',
          auto_corrected: true,
          correction_applied: 'Field cleared — requires manual review'
        });
        return `[REVIEW REQUIRED]`;
      }
    }
    return value;
  };

  // Check skills items
  result.skills = (result.skills || []).map((category, ci) => ({
    ...category,
    items: (category.items || [])
      .map((item, ii) => checkField(item, `skills[${ci}].items[${ii}]`))
      .filter(item => typeof item === 'string' && !item.includes('[REVIEW REQUIRED]'))
  })).filter(category => category.items && category.items.length > 0);

  // ── CHECK 5: MISSING REQUIRED KEYWORDS IN SKILLS ───────────
  const allSkillText = result.skills
    .flatMap(c => c.items)
    .join(' ')
    .toLowerCase();

  const missingRequired = registry.jd.required_skills_verbatim.filter(
    skill => !allSkillText.includes(skill.toLowerCase())
  );

  for (const missing of missingRequired) {
    violations.push({
      type: 'MISSING_REQUIRED_SKILL',
      location: 'skills',
      found: 'absent',
      expected: missing,
      auto_corrected: true,
      correction_applied: `Added "${missing}" to relevant skills category`
    });

    // Auto-inject into most relevant category
    const targetCategory = findBestSkillCategory(result.skills, missing);
    if (targetCategory) {
      targetCategory.items.push(missing);
    } else {
      result.skills.push({
        category: 'Additional Skills',
        items: [missing]
      });
    }
  }

  // ── CHECK 6: BULLET LENGTH ──────────────────────────────────
  result.experience = (result.experience || []).map((exp, ei) => ({
    ...exp,
    bullets: (exp.bullets || []).map((bullet, bi) => {
      const words = bullet.split(' ');
      if (words.length > 22) {
        violations.push({
          type: 'BULLET_TOO_LONG',
          location: `experience[${ei}].bullets[${bi}]`,
          found: `${words.length} words`,
          expected: '22 words max',
          auto_corrected: true,
          correction_applied: 'Truncated to 22 words'
        });
        return words.slice(0, 22).join(' ');
      }
      return bullet;
    })
  }));

  // ── CHECK 7: EDUCATION PRESENT ──────────────────────────────
  if (!result.education || result.education.length === 0) {
    violations.push({
      type: 'EMPTY_SECTION',
      location: 'education',
      found: 'empty',
      expected: 'At least one education entry',
      auto_corrected: true,
      correction_applied: 'Added placeholder — review required'
    });
    result.education = [{
      degree: '[ADD DEGREE]',
      institution: '[ADD INSTITUTION]',
      location: '',
      year: '',
      score: '',
      relevant_courses: ''
    }];
  }

  // ── CHECK 8: HEADER INTEGRITY ───────────────────────────────
  result.header.name = registry.candidate.name;
  result.header.email = registry.candidate.email;
  result.header.phone = registry.candidate.phone;

  return { corrected: result, violations };
}
