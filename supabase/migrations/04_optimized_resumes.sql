create table if not exists public.optimized_resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  original_resume_id uuid,
  target_company text,
  target_role text,
  jd_hash text not null,
  jd_text text not null,
  ai_raw_json jsonb not null,
  rendered_resume_text text,
  ats_breakdown_json jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security
alter table public.optimized_resumes enable row level security;

-- Policies
create policy "Users can view their own optimized resumes"
  on public.optimized_resumes for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own optimized resumes"
  on public.optimized_resumes for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own optimized resumes"
  on public.optimized_resumes for delete
  using ( auth.uid() = user_id );

-- Indices
create index if not exists optimized_resumes_user_id_idx on public.optimized_resumes(user_id);
create index if not exists optimized_resumes_jd_hash_idx on public.optimized_resumes(jd_hash);
