-- Create user_actions table for tracking engagement
CREATE TABLE IF NOT EXISTS public.user_actions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  action_type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Setup Row Level Security (RLS)
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;

-- Policies for user_actions
CREATE POLICY "Users can view own actions" on public.user_actions for select using (auth.uid() = user_id);
CREATE POLICY "Users can insert own actions" on public.user_actions for insert with check (auth.uid() = user_id);
CREATE POLICY "Users can delete own actions" on public.user_actions for delete using (auth.uid() = user_id);
