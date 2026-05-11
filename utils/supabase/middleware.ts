import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const updateSession = async (request: NextRequest) => {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/auth')) && !request.nextUrl.pathname.startsWith('/auth/callback')
  const isCheckoutPage = request.nextUrl.pathname.startsWith('/checkout') || request.nextUrl.pathname.startsWith('/payment')
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')
  const isAtsPage = request.nextUrl.pathname.startsWith('/ats-score')

  // 0. Redirect away from login if already authenticated
  if (user && isAuthPage) {
    const nextPath = request.nextUrl.searchParams.get('next') || '/dashboard'
    const url = request.nextUrl.clone()
    url.pathname = nextPath
    return NextResponse.redirect(url)
  }

  // 1. Auth Gate: If trying to access protected areas and not logged in
  if (!user && (isDashboardPage || isCheckoutPage)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // 2. Payment Gate: If logged in but not Pro
  if (user && isDashboardPage) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .single()

    if (profile?.tier !== 'pro') {
      const url = request.nextUrl.clone()
      url.pathname = '/checkout'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
};
