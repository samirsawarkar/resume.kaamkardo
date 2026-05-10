import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1, "Supabase URL is required"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1, "Supabase key is required"),
  OPENAI_API_KEY: z.string().optional().or(z.literal('')),
  SERPER_API_KEY: z.string().min(1, "Serper API key is required"),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  SERPER_API_KEY: process.env.SERPER_API_KEY,
});
