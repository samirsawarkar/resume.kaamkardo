// ═══════════════════════════════════════════════════════════════
// app/api/optimize/route.ts
// The Server-Sent Events (SSE) endpoint that streams progress
// from the resume optimization orchestrator to the frontend.
// ═══════════════════════════════════════════════════════════════

import { runResilientPipeline as runOptimizationPipeline } from "../../../lib/core/resilient-orchestrator";

export const maxDuration = 60; // 60 seconds (Vercel max for Hobby, configure accordingly)

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawResume = body.rawResume || body.rawResumeText;
    const rawJD = body.rawJD || body.jdText;

    // Validate inputs before starting pipeline
    if (!rawResume || rawResume.length < 100) {
      return new Response(
        JSON.stringify({ error: 'Resume text too short or missing' }), 
        { status: 400 }
      );
    }
    if (!rawJD || rawJD.length < 50) {
      return new Response(
        JSON.stringify({ error: 'Job description too short or missing' }), 
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: any) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        };

        try {
          for await (const event of runOptimizationPipeline(rawResume, rawJD, send)) {
            send(event);
          }
        } catch (error: any) {
          send({
            step: 5,
            status: 'error',
            progress: 0,
            message: 'Pipeline failed. Please try again.',
            payload: { error: error.error_message || error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error)) }
          });
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
