// ═══════════════════════════════════════════════════════════════
// lib/pipeline/sanitizer.ts
// Pure functional cleanup that runs immediately before document
// rendering. Enforces 7 non-negotiable rules.
// ═══════════════════════════════════════════════════════════════

import type { OptimizedResume, JDIntelligence } from "./types";

export function sanitizeResumeJSON(
  resume: OptimizedResume,
  jdIntel: JDIntelligence
): OptimizedResume {
  // Always create a deep copy to keep functions pure
  const result: OptimizedResume = JSON.parse(JSON.stringify(resume));

  // Initialize arrays if missing to avoid errors
  if (!result.meta) {
    result.meta = {
      ats_score_projected: 0,
      keyword_coverage_percent: 0,
      jd_role_targeted: "",
      optimization_date: new Date().toISOString(),
      inferred_metrics: [],
      data_integrity_warnings: [],
      hard_gaps_not_bridged: [],
    };
  }
  if (!result.meta.data_integrity_warnings) {
    result.meta.data_integrity_warnings = [];
  }

  // ────────────────────────────────────────────────────────────────
  // 1. CURRENCY FIX
  // ────────────────────────────────────────────────────────────────
  const indianLocations = [
    "India", "Mumbai", "Delhi", "Pune", "Bangalore", "Bengaluru",
    "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Noida", "Gurgaon", "Gurugram"
  ];
  
  const isIndiaBased = indianLocations.some(loc => 
    jdIntel.location?.toLowerCase().includes(loc.toLowerCase())
  );

  const fixCurrency = (text: string) => {
    if (!isIndiaBased) return text;
    return text.replace(/\$|£/g, "₹");
  };

  if (result.summary) {
    result.summary = fixCurrency(result.summary);
  }
  
  if (result.experience) {
    result.experience.forEach(exp => {
      if (exp.bullets) {
        exp.bullets = exp.bullets.map(fixCurrency);
      }
    });
  }

  if (result.projects) {
    result.projects.forEach(proj => {
      if (proj.bullets) {
        proj.bullets = proj.bullets.map(fixCurrency);
      }
    });
  }

  // ────────────────────────────────────────────────────────────────
  // 2. BLANK COMPANY FIX
  // ────────────────────────────────────────────────────────────────
  if (result.experience) {
    result.experience.forEach(exp => {
      if (!exp.company || exp.company.trim() === "") {
        exp.company = "Independent Project";
      }
    });
  }

  // ────────────────────────────────────────────────────────────────
  // 3. JD TEXT CONTAMINATION CHECK
  // ────────────────────────────────────────────────────────────────
  const jdMarkers = [
    "## Company", "## Role", "## Job Description", "---",
    "## Responsibilities", "## Required Skills", "## Preferred Skills"
  ];

  const hasContamination = (text: string): boolean => {
    if (typeof text !== "string") return false;
    return jdMarkers.some(marker => text.includes(marker));
  };

  const contaminationFlag = "[REVIEW REQUIRED: AI contaminated this field with JD text]";

  // Recursively check all string values in the JSON object
  const traverseAndClean = (obj: any, path: string = "") => {
    if (!obj || typeof obj !== "object") return;
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (typeof obj[key] === "string") {
          if (hasContamination(obj[key])) {
            obj[key] = contaminationFlag;
            result.meta.data_integrity_warnings.push(
              `Contamination detected and removed at: ${path}.${key}`
            );
          }
        } else if (typeof obj[key] === "object") {
          traverseAndClean(obj[key], path === "" ? key : `${path}.${key}`);
        }
      }
    }
  };

  // Only traverse the content fields (skip meta to avoid self-flagging)
  const contentToClean = {
    header: result.header,
    summary: result.summary,
    skills: result.skills,
    experience: result.experience,
    projects: result.projects,
    open_source: result.open_source,
    publications: result.publications,
    education: result.education,
    certifications: result.certifications,
    languages: result.languages
  };
  traverseAndClean(contentToClean);

  // ────────────────────────────────────────────────────────────────
  // 4. BULLET LENGTH ENFORCEMENT
  // ────────────────────────────────────────────────────────────────
  const truncateBullet = (bullet: string, source: string): string => {
    if (!bullet) return bullet;
    const words = bullet.split(/\s+/);
    if (words.length > 22) {
      result.meta.data_integrity_warnings.push(`Truncated >22 word bullet in ${source}`);
      return words.slice(0, 22).join(" ") + "...";
    }
    return bullet;
  };

  if (result.experience) {
    result.experience.forEach(exp => {
      if (exp.bullets) {
        exp.bullets = exp.bullets.map(b => truncateBullet(b, `experience role: ${exp.role}`));
      }
    });
  }

  if (result.projects) {
    result.projects.forEach(proj => {
      if (proj.bullets) {
        proj.bullets = proj.bullets.map(b => truncateBullet(b, `project: ${proj.name}`));
      }
    });
  }

  // ────────────────────────────────────────────────────────────────
  // 5. SKILLS CONTAMINATION CHECK
  // ────────────────────────────────────────────────────────────────
  if (result.skills && Array.isArray(result.skills)) {
    const cleanSkills: typeof result.skills = [];
    
    for (const category of result.skills) {
      if (!category.items || !Array.isArray(category.items)) continue;
      
      const cleanItems = category.items.filter(item => {
        const isContaminated = item.includes("#") || 
                               item.includes("---") || 
                               item.includes("##") || 
                               item.includes("* ");
        if (isContaminated) {
          result.meta.data_integrity_warnings.push(`Removed contaminated skill item: "${item}"`);
        }
        return !isContaminated;
      });

      if (cleanItems.length > 0) {
        cleanSkills.push({
          category: category.category,
          items: cleanItems
        });
      } else {
        result.meta.data_integrity_warnings.push(`Removed empty skills category: "${category.category}"`);
      }
    }
    
    result.skills = cleanSkills;
  }

  // ────────────────────────────────────────────────────────────────
  // 6. EDUCATION NULL GUARD
  // ────────────────────────────────────────────────────────────────
  if (!result.education || !Array.isArray(result.education) || result.education.length === 0) {
    result.education = [{
      degree: "[ADD YOUR DEGREE]",
      institution: "[ADD YOUR INSTITUTION]",
      location: "",
      year: "",
      score: "",
      relevant_courses: ""
    }];
    result.meta.data_integrity_warnings.push("Education section missing; added placeholder.");
  }

  // ────────────────────────────────────────────────────────────────
  // 7. SUMMARY WORD COUNT
  // ────────────────────────────────────────────────────────────────
  if (result.summary) {
    const words = result.summary.split(/\s+/);
    if (words.length > 70) {
      result.summary = words.slice(0, 70).join(" ") + "...";
      result.meta.data_integrity_warnings.push("Summary truncated (exceeded 70 words).");
    } else if (words.length < 20) {
      result.meta.data_integrity_warnings.push(`Summary is too short (${words.length} words; minimum 20).`);
    }
  } else {
    result.summary = "";
    result.meta.data_integrity_warnings.push("Summary missing entirely.");
  }

  return result;
}
