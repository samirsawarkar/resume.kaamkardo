export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
  id: string;
  status: JobStatus;
  progress: string; // e.g., "Step 2: Gap Analysis"
  result?: any;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

// In-memory store
// Use globalThis to persist the Map across Next.js Hot Module Replacement (HMR) reloads in dev mode.
const globalForJobs = globalThis as unknown as {
  __jobs: Map<string, Job> | undefined;
  __cleanupSet: boolean | undefined;
};

const jobs = globalForJobs.__jobs ?? new Map<string, Job>();

if (process.env.NODE_ENV !== 'production') {
  globalForJobs.__jobs = jobs;
}

export function createJob(id: string): Job {
  const job: Job = {
    id,
    status: 'pending',
    progress: 'Queued...',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  jobs.set(id, job);
  return job;
}

export function updateJob(id: string, updates: Partial<Job>): void {
  const job = jobs.get(id);
  if (job) {
    jobs.set(id, { ...job, ...updates, updatedAt: Date.now() });
  }
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

// Cleanup old jobs to prevent memory leaks (only initialize once)
if (!globalForJobs.__cleanupSet) {
  setInterval(() => {
    const now = Date.now();
    for (const [id, job] of jobs.entries()) {
      // Remove jobs older than 1 hour
      if (now - job.createdAt > 60 * 60 * 1000) {
        jobs.delete(id);
      }
    }
  }, 5 * 60 * 1000);
  globalForJobs.__cleanupSet = true;
}
