import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function proxy(request) {
  const pathname = request.nextUrl.pathname;

  const protectedPaths = ['/dashboard'];
  const adminPaths = ['/admin'];

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isAdminPath = adminPaths.some((path) =>
    pathname.startsWith(path)
  );

  // For all public routes (homepage, /charities, /how-it-works, /subscribe, public API, etc.),
  // return immediately without blocking on network authentication.
  if (!isProtectedPath && !isAdminPath) {
    return NextResponse.next({ request });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // If Supabase is unconfigured or using placeholder values, handle mock auth quickly without hanging
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    // Check if user has an auth token in cookies
    const authCookie = request.cookies.get('sb-access-token') || 
                       request.cookies.get('supabase-auth-token') ||
                       request.cookies.get('sb-auth-token');
    if (!authCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    // Allow sufficient time for Supabase network response (8s)
    const authPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth check timeout')), 8000)
    );
    const { data: { user } } = await Promise.race([authPromise, timeoutPromise]);

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
