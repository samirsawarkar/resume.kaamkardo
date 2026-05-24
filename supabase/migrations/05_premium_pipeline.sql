-- Add new columns to track the multi-stage pipeline state
alter table public.optimized_resumes
add column if not exists extracted_json jsonb,
add column if not exists jd_intelligence_json jsonb,
add column if not exists validation_issues_json jsonb,
add column if not exists final_optimized_json jsonb;
