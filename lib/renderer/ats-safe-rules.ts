// ═══════════════════════════════════════════════════════════════
// lib/renderer/ats-safe-rules.ts
// Constants enforcing hard ATS (Applicant Tracking System) rules.
// ═══════════════════════════════════════════════════════════════

export const ATS_FONTS = {
  // Arial or Calibri only. No decorative fonts.
  PRIMARY: "Arial",
  SECONDARY: "Calibri",
};

export const ATS_SIZES = {
  // 10pt minimum for body, 11–12pt preferred, 14pt for name header maximum.
  NAME_HEADER: 14,
  SECTION_HEADING: 12,
  BODY_TEXT: 11,
  SMALL_TEXT: 10,
};

export const ATS_MARGINS = {
  // Minimum 0.75 inches (1080 twips) on all sides.
  // In docx twips (1 inch = 1440 twips), 0.75 in = 1080 twips.
  TOP: 1080,
  BOTTOM: 1080,
  LEFT: 1080,
  RIGHT: 1080,
};

// Section headings must use standard labels exactly.
export const STANDARD_SECTION_HEADINGS = {
  SUMMARY: "Professional Summary",
  SKILLS: "Skills",
  EXPERIENCE: "Experience",
  PROJECTS: "Projects",
  EDUCATION: "Education",
  CERTIFICATIONS: "Certifications",
  PUBLICATIONS: "Publications",
  OPEN_SOURCE: "Open Source",
  LANGUAGES: "Languages",
};

// Document section rendering order
export const SECTION_RENDER_ORDER = [
  "HEADER",
  "METRICS_BAR",
  "SUMMARY",
  "SKILLS",
  "EXPERIENCE",
  "PROJECTS",
  "OPEN_SOURCE",
  "PUBLICATIONS",
  "EDUCATION",
  "CERTIFICATIONS",
  "LANGUAGES"
] as const;

export type SectionRenderKey = typeof SECTION_RENDER_ORDER[number];
