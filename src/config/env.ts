import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1, "Supabase URL is required"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1, "Supabase key is required"),
  OPENAI_API_KEY_1: z.string().optional().or(z.literal('')),
  OPENAI_API_KEY_2: z.string().optional().or(z.literal('')),
  OPENAI_BASE_URL: z.string().optional(),
  SERPER_API_KEY: z.string().min(1, "Serper API key is required"),
});

// Lazy validation: only runs at request-time, not at build-time.
function getEnv() {
  return envSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    OPENAI_API_KEY_1: process.env.OPENAI_API_KEY_1,
    OPENAI_API_KEY_2: process.env.OPENAI_API_KEY_2,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    SERPER_API_KEY: process.env.SERPER_API_KEY,
  });
}

export const env = new Proxy({} as ReturnType<typeof getEnv>, {
  get(_target, prop) {
    return getEnv()[prop as keyof ReturnType<typeof getEnv>];
  },
});
