// ═══════════════════════════════════════════════════════════════
// lib/core/schema-coercer.ts
// Level 2 Defense: Operates on successfully parsed JSON.
// Coerces types, unwraps schemas, injects Truth Registry fallbacks.
// ═══════════════════════════════════════════════════════════════

import { TruthRegistry } from "./truth-registry";
import { OptimizedResume } from "../pipeline/types";

export function coerceToSchema(parsed: any, registry: TruthRegistry): Partial<OptimizedResume> {
  if (!parsed || typeof parsed !== 'object') {
    parsed = {};
  }

  // 1. UNWRAP DETECTION
  const wrappers = ["resume", "output", "result", "optimized_resume", "data", "content", "response", "generated_resume"];
  let data = parsed;
  for (const wrapper of wrappers) {
    if (parsed[wrapper] && typeof parsed[wrapper] === 'object' && !Array.isArray(parsed[wrapper])) {
      data = parsed[wrapper];
      break;
    }
  }

  const result: Partial<OptimizedResume> = {};

  // 2. HEADER
  const inHeader = data.header || {};
  result.header = {
    name: registry.candidate?.name || "Candidate Name",
    email: registry.candidate?.email || "email@example.com",
    phone: registry.candidate?.phone || "Phone Number",
    location: typeof inHeader.location === 'string' && inHeader.location.trim() ? inHeader.location : (registry.candidate?.location || "Location Not Specified"),
    tagline: typeof inHeader.tagline === 'string' && inHeader.tagline.trim() ? inHeader.tagline : `Professional`,
    links: typeof inHeader.links === 'object' && inHeader.links !== null ? inHeader.links : (registry.candidate?.links || {})
  };

  // 3. SUMMARY
  const inSum = data.summary;
  if (typeof inSum === 'string' && inSum.trim()) {
    result.summary = inSum.split(' ').slice(0, 70).join(' '); // truncate to 70 words
  } else if (Array.isArray(inSum)) {
    result.summary = inSum.join(' ').split(' ').slice(0, 70).join(' ');
  } else {
    result.summary = `Experienced professional with a proven track record. Skilled in delivering high-quality results and driving project success.`;
  }

  // 4. SKILLS
  const inSkills = data.skills;
  let coercedSkills: Array<{category: string, items: string[]}> = [];
  
  if (typeof inSkills === 'string') {
    coercedSkills = [{ category: "Technical Skills", items: inSkills.split(',').map(s => s.trim()).filter(Boolean) }];
  } else if (Array.isArray(inSkills)) {
    if (inSkills.length > 0 && typeof inSkills[0] === 'string') {
      coercedSkills = [{ category: "Core Competencies", items: inSkills.filter(s => typeof s === 'string').map(s => String(s).trim()) }];
    } else if (inSkills.length > 0 && inSkills[0] && typeof inSkills[0] === 'object' && inSkills[0].category) {
      coercedSkills = inSkills.map((sk: any) => ({
        category: String(sk.category || 'Skills'),
        items: Array.isArray(sk.items) ? sk.items.filter((i: any) => typeof i === 'string').map((i: any) => String(i).replace(/[#\-]/g, '').trim()) : []
      }));
    }
  } else if (inSkills && typeof inSkills === 'object') {
    for (const [key, value] of Object.entries(inSkills)) {
      if (Array.isArray(value)) {
        coercedSkills.push({ category: key, items: value.filter((i: any) => typeof i === 'string').map((i: any) => String(i).replace(/[#\-]/g, '').trim()) });
      } else if (typeof value === 'string') {
        coercedSkills.push({ category: key, items: [value.replace(/[#\-]/g, '').trim()] });
      }
    }
  }

  // Ensure must-haves are injected
  if (coercedSkills.length === 0) {
    coercedSkills.push({ category: "Technical Skills", items: [] });
  }
  const allItems = new Set(coercedSkills.flatMap(c => c.items.map(i => i.toLowerCase())));
  const mustHaves = registry.jd?.required_skills_verbatim || [];
  for (const mh of mustHaves) {
    if (!allItems.has(mh.toLowerCase())) {
      coercedSkills[0].items.push(mh);
      allItems.add(mh.toLowerCase());
    }
  }
  result.skills = coercedSkills;

  // 5. EXPERIENCE
  const inExp = data.experience;
  result.experience = [];
  if (Array.isArray(inExp)) {
    result.experience = inExp.map(exp => {
      let company = String(exp?.company || '').trim();
      const legit = (registry.legitimate_companies || []).map(c => c.toLowerCase());
      
      if (!company || company.toLowerCase() === 'string' || company === 'null' || company === 'undefined') {
        company = "Independent Project";
      } else if (company.toLowerCase() === (registry.jd_company || '').toLowerCase() && !legit.includes(company.toLowerCase())) {
        company = "Independent Project";
      } else if (!legit.includes(company.toLowerCase()) && company !== "Independent Project") {
        // Technically strict coercion rules say to replace if not legitimate
        company = "Independent Project";
      }

      let bullets: string[] = [];
      if (typeof exp?.bullets === 'string') {
        bullets = exp.bullets.split(',').map((b: any) => String(b).trim()).filter(Boolean);
      } else if (Array.isArray(exp?.bullets)) {
        bullets = exp.bullets.filter((b: any) => b && typeof b === 'string').map((b: any) => String(b).trim());
      }
      if (bullets.length === 0) bullets = ["Role details not available"];
      
      bullets = bullets.map((b: any) => {
        const words = String(b).split(' ');
        return words.length > 22 ? words.slice(0, 22).join(' ') + '...' : b;
      });

      return {
        role: typeof exp?.role === 'string' && exp.role.trim() && exp.role !== 'string' ? exp.role : "Professional Role",
        company,
        duration: typeof exp?.duration === 'string' && exp.duration.trim() && exp.duration !== 'string' ? exp.duration.replace('-', '–') : "Date not specified",
        location: typeof exp?.location === 'string' && exp.location.trim() && exp.location !== 'string' ? exp.location : (registry.candidate?.location || "Location not specified"),
        subtitle: typeof exp?.subtitle === 'string' && exp.subtitle !== 'string' ? exp.subtitle : "",
        bullets
      };
    });
  }

  // 6. PROJECTS
  const inProj = data.projects;
  result.projects = [];
  if (Array.isArray(inProj)) {
    result.projects = inProj.map(p => {
      let bullets: string[] = [];
      if (typeof p?.bullets === 'string') bullets = p.bullets.split(',').map((b: any) => String(b).trim()).filter(Boolean);
      else if (Array.isArray(p?.bullets)) bullets = p.bullets.filter((b: any) => b && typeof b === 'string').map((b: any) => String(b).trim());
      if (bullets.length === 0) bullets = ["Project details not available"];
      bullets = bullets.map((b: any) => {
        const words = String(b).split(' ');
        return words.length > 22 ? words.slice(0, 22).join(' ') + '...' : b;
      });

      return {
        name: typeof p?.name === 'string' && p.name.trim() && p.name !== 'string' ? p.name : "Project",
        subtitle: typeof p?.subtitle === 'string' && p.subtitle !== 'string' ? p.subtitle : "",
        duration: typeof p?.duration === 'string' && p.duration !== 'string' ? p.duration : "",
        bullets
      };
    });
  }

  // Ensure all registry projects are present
  const originalProjects = registry.original_projects || [];
  const existingProjNames = new Set(result.projects.map(p => p.name.toLowerCase()));
  for (const op of originalProjects) {
    if (op.name && !existingProjNames.has(op.name.toLowerCase())) {
      result.projects.push({
        name: op.name,
        subtitle: (op as any).subtitle || (op as any).tech_stack?.join(", ") || "",
        duration: op.duration || "",
        bullets: (op as any).original_bullets || []
      });
    }
  }

  // 7. EDUCATION
  const inEdu = data.education;
  result.education = [];
  if (Array.isArray(inEdu)) {
    result.education = inEdu.map((e: any) => ({
      institution: String(e?.institution || '').trim() || "Educational Institution",
      degree: String(e?.degree || '').trim() || "Degree",
      year: String(e?.year || '').trim(),
      score: String(e?.score || '').trim(),
      location: String(e?.location || '').trim(),
      relevant_courses: String(e?.relevant_courses || '').trim()
    }));
  }

  // 8. PUBLICATIONS / OPEN SOURCE / CERTIFICATIONS / LANGUAGES
  result.publications = Array.isArray(data.publications) ? data.publications.map((p: any) => ({
    title: String(p?.title || ''),
    venue: String(p?.venue || p?.publisher || ''),
    year: String(p?.year || ''),
    doi_or_url: String(p?.doi_or_url || p?.link || ''),
    one_line: String(p?.one_line || '')
  })) : [];

  if (result.publications!.length === 0 && (registry.original_projects?.some((p: any) => p.name.toLowerCase().includes('research') || p.name.toLowerCase().includes('open source')))) {
    result.publications!.push({ title: "Research / Open Source Work", venue: "", year: "", doi_or_url: "", one_line: "" });
  }

  result.open_source = Array.isArray(data.open_source) ? data.open_source.map((o: any) => ({
    project_name: String(o?.project_name || ''),
    role: String(o?.role || ''),
    link: String(o?.link || ''),
    description: String(o?.description || '')
  })) : [];

  result.certifications = Array.isArray(data.certifications) ? data.certifications.map((c: any) => ({
    name: String(c?.name || ''),
    issuer: String(c?.issuer || ''),
    year: String(c?.year || '')
  })) : [];

  if (typeof data.languages === 'string') {
    result.languages = data.languages.split(',').map((l: any) => String(l).trim()).filter(Boolean);
  } else if (Array.isArray(data.languages)) {
    result.languages = data.languages.map((l: any) => String(l).trim()).filter(Boolean);
  } else {
    result.languages = [];
  }

  // 9. METRICS BAR
  result.metrics_bar = Array.isArray(data.metrics_bar) ? data.metrics_bar.map((m: any) => ({
    value: String(m?.value || ''),
    label: String(m?.label || '')
  })) : [];
  if (result.metrics_bar!.length < 4) {
    const fallbackMetrics = registry.original_metrics || [
      { value: "3+", label: "Years Experience" },
      { value: "100%", label: "Delivery Rate" },
      { value: "5+", label: "Projects Completed" },
      { value: "1", label: "Domain Focus" }
    ];
    result.metrics_bar = [...(result.metrics_bar as any), ...fallbackMetrics].slice(0, Math.max(4, result.metrics_bar!.length));
  }

  // 10. META
  const inMeta = data.meta || {};
  result.meta = {
    optimization_date: new Date().toISOString(),
    ats_score_projected: typeof inMeta.ats_score_projected === 'number' ? inMeta.ats_score_projected : 75,
    keyword_coverage_percent: typeof inMeta.keyword_coverage_percent === 'number' ? inMeta.keyword_coverage_percent : 70,
    jd_role_targeted: String(inMeta.jd_role_targeted || ''),
    inferred_metrics: Array.isArray(inMeta.inferred_metrics) ? inMeta.inferred_metrics : [],
    data_integrity_warnings: Array.isArray(inMeta.data_integrity_warnings) ? inMeta.data_integrity_warnings : [],
    hard_gaps_not_bridged: Array.isArray(inMeta.hard_gaps_not_bridged) ? inMeta.hard_gaps_not_bridged : []
  };

  return result;
}
