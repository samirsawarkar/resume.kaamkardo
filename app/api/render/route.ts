import { NextRequest, NextResponse } from "next/server";
import { Packer } from "docx";
import { withAuth } from "@/src/lib/auth-guard";
import { AppError } from "@/src/lib/errors";
import { generateDocx } from "@/lib/rendering/docx-generator";

export const POST = withAuth(async (req, user) => {
  try {
    const { finalOptimizedJson, templateId = "executive" } = await req.json();

    if (!finalOptimizedJson || !finalOptimizedJson.header) {
      throw new AppError("Missing or invalid final optimized resume JSON", 400);
    }

    // LAYER 3: Rendering Engine (Pure JS, Zero AI)
    console.log("[Rendering Layer] Building ATS-safe DOCX with template:", templateId);

    const doc = generateDocx(finalOptimizedJson, templateId);
    const buffer = await Packer.toBuffer(doc);

    // Return the base64 string so frontend can trigger download
    return NextResponse.json({
      success: true,
      docxBase64: buffer.toString("base64"),
      filename: `${(finalOptimizedJson.header?.name || "resume").replace(/\s+/g, "_")}_Optimized.docx`
    });

  } catch (err: any) {
    console.error("[Rendering Layer] Error:", err);
    return NextResponse.json(
      { error: err.message || "Rendering failed." },
      { status: err.status || 500 }
    );
  }
});
