// ═══════════════════════════════════════════════════════════════
// lib/parser/resume-parser.ts
// Extracts text from PDF/DOCX file uploads.
// ═══════════════════════════════════════════════════════════════

// NOTE: Implement actual PDF/DOCX parsing (e.g. using pdf-parse or mammoth) here.
// Currently acts as a placeholder / interface boundary as the frontend 
// currently extracts text client-side before calling the API.

export async function parseResumeFile(fileBuffer: Buffer, mimeType: string): Promise<string> {
  // If the file is already text, just return it
  if (mimeType.includes("text/plain")) {
    return fileBuffer.toString("utf-8");
  }

  // TODO: Add pdf-parse or mammoth logic if server-side extraction is needed.
  throw new Error(`Server-side extraction for ${mimeType} is not implemented yet.`);
}

export function cleanResumeText(rawText: string): string {
  if (!rawText) return "";

  let cleaned = rawText.trim();
  
  // Clean up typical OCR / extraction artifacts
  cleaned = cleaned.replace(/\r\n/g, "\n");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  cleaned = cleaned.replace(/[ \t]+/g, " ");

  // Safeguard against insanely large inputs
  if (cleaned.length > 15000) {
    cleaned = cleaned.substring(0, 15000) + "... [TRUNCATED]";
  }

  return cleaned;
}
