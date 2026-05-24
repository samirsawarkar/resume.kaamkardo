// ═══════════════════════════════════════════════════════════════
// lib/parser/jd-parser.ts
// Cleans and structures raw Job Description text input.
// ═══════════════════════════════════════════════════════════════

export function cleanJobDescription(rawJd: string): string {
  if (!rawJd) return "";

  let cleaned = rawJd.trim();

  // Remove excessively long repeating characters
  cleaned = cleaned.replace(/[-=_]{4,}/g, "---");

  // Remove excessive whitespace
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  cleaned = cleaned.replace(/[ \t]+/g, " ");

  // Ensure reasonable max length to avoid token explosion
  // Approx 10000 chars is plenty for any JD
  if (cleaned.length > 10000) {
    cleaned = cleaned.substring(0, 10000) + "... [TRUNCATED]";
  }

  return cleaned;
}
