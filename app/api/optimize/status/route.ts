import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/src/lib/auth-guard";
import { getJob } from "@/src/lib/job-queue";

export const GET = withAuth(async (req) => {
  const url = new URL(req.url);
  const jobId = url.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }

  const job = getJob(jobId);

  if (!job) {
    return NextResponse.json({ error: "Job not found or expired" }, { status: 404 });
  }

  return NextResponse.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    result: job.result,
    error: job.error
  });
});
