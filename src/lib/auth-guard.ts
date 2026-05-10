import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/src/config/env";
import { AppError } from "./errors";

export async function getSession() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return null;
  }
  return data.user;
}

export type AuthenticatedHandler = (
  req: NextRequest,
  user: any
) => Promise<NextResponse>;

export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest) => {
    try {
      const user = await getSession();
      if (!user) {
        throw new AppError("Unauthorized access. Please log in.", 401);
      }
      return await handler(req, user);
    } catch (error: any) {
      console.error("[API_ERROR]", error);
      const status = error.status || 500;
      const message = error.message || "An unexpected error occurred.";
      return NextResponse.json({ error: message }, { status });
    }
  };
}
