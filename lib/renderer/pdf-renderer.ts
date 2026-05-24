// ═══════════════════════════════════════════════════════════════
// lib/renderer/pdf-renderer.ts
// ATS-Safe PDF Builder.
// NOTE: PDF generation is complex without custom font management.
// Using pdfmake internally for server-side generation requires fonts.
// Returning a dummy buffer for now to unblock the API orchestration,
// as pdfmake is often run client-side in Next.js apps.
// ═══════════════════════════════════════════════════════════════

import type { OptimizedResume } from "../pipeline/types";

export async function buildPdf(resume: OptimizedResume): Promise<Buffer> {
  // In a full implementation using pdfme or pdfmake server-side,
  // we would construct the PDF buffer here.
  // We return a simple text buffer for now. The client already uses
  // pdfmake directly in the browser which is the preferred approach
  // for avoiding Node.js font path issues on edge networks.
  return Buffer.from("PDF generation is handled client-side via pdfmake.");
}
