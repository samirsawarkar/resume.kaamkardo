-- Add 'tier' column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier text default 'free';

-- Ensure the column value can only be 'free' or 'pro'
ALTER TABLE public.profiles ADD CONSTRAINT check_tier CHECK (tier in ('free', 'pro'));
