import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard";
  
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = request.headers.get("host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const baseUrl = isLocalEnv ? origin : `https://${forwardedHost || host}`;

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
}
