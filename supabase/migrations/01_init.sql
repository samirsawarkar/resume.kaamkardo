-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  score integer not null,
  target_role text not null,
  analysis_json jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create job_applications table for the Kanban board
CREATE TABLE IF NOT EXISTS public.job_applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  company text,
  link text not null,
  status text not null check (status in ('applied', 'interviewing', 'offer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Setup Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" on public.profiles for select using (auth.uid() = id);
CREATE POLICY "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
CREATE POLICY "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Policies for resumes
CREATE POLICY "Users can view own resumes" on public.resumes for select using (auth.uid() = user_id);
CREATE POLICY "Users can insert own resumes" on public.resumes for insert with check (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" on public.resumes for update using (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" on public.resumes for delete using (auth.uid() = user_id);

-- Policies for job applications
CREATE POLICY "Users can view own job applications" on public.job_applications for select using (auth.uid() = user_id);
CREATE POLICY "Users can insert own job applications" on public.job_applications for insert with check (auth.uid() = user_id);
CREATE POLICY "Users can update own job applications" on public.job_applications for update using (auth.uid() = user_id);
CREATE POLICY "Users can delete own job applications" on public.job_applications for delete using (auth.uid() = user_id);
