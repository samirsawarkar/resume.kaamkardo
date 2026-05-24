import { NextResponse } from "next/server";
import OpenAI from "openai";
import pdf from "pdf-parse";
import { withAuth } from "@/src/lib/auth-guard";
import { env } from "@/src/config/env";
import { AppError } from "@/src/lib/errors";
import { extractJson } from "@/src/lib/json-extractor";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_1 || process.env.OPENAI_API_KEY_2 || "dummy-key-for-build",
  baseURL: process.env.OPENAI_BASE_URL || "https://api.aicredits.in/v1",
});

export const POST = withAuth(async (req) => {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    throw new AppError("No resume file provided", 400);
  }

  // 1. Extract text using pdf-parse
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  let extractedText = "";
  try {
    const pdfData = await pdf(buffer);
    extractedText = pdfData.text;
  } catch (parseErr) {
    console.error("PDF Parsing failed:", parseErr);
    throw new AppError("Failed to read the PDF structure. Ensure it is a valid text-based PDF.", 400);
  }

  if (!extractedText || extractedText.trim().length === 0) {
    throw new AppError("No readable text found in this PDF. It may be an image.", 400);
  }

  // 2. Analyze the extracted text with OpenAI
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL_THINKING || "z-ai/glm-4-32b",
      messages: [
        {
          role: "system",
          content: `You are an elite ATS parsing and hiring analysis engine. You will be provided with the raw text extracted from a user's resume PDF.
          You must evaluate this resume and return a STRICT JSON object containing the following keys exactly:
          {
            "atsScore": <number between 1 and 100 based on standard ATS readability, keywords, and impact metrics>,
            "targetRole": "<string, the primary job title this resume is targeting. Keep it concise, e.g. 'Software Engineer'>",
            "strengths": [<array of strings, up to 3 brief bullet points highlighting the strongest aspects>],
            "weaknesses": [<array of strings, up to 3 brief bullet points highlighting weaknesses like 'missing metrics', 'poor formatting', etc.>]
          }
          Do not include any markdown formatting, backticks, or extra text. Output only raw JSON.`
        },
        {
          role: "user",
          content: `Here is the raw resume text:\n\n${extractedText.substring(0, 15000)}`
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0].message.content;
    
    if (!responseContent) {
      throw new AppError("AI failed to generate a response.", 500);
    }
    
    let analysis;
    try {
      analysis = extractJson(responseContent);
      analysis.extractedText = extractedText; // Inject raw text so frontend can save it for Premium path
    } catch (e) {
      console.error("Failed to parse parse-resume output:", responseContent);
      throw new AppError("AI returned an invalid JSON format.", 500);
    }
    return NextResponse.json(analysis, { status: 200 });

  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    if (error.status === 429 || error?.response?.status === 429 || error.message?.includes('429')) {
      return NextResponse.json(
        { error: "Rate limit reached. The free ATS engine is currently under heavy load." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Failed to parse resume with AI engine." },
      { status: 500 }
    );
  }
});
