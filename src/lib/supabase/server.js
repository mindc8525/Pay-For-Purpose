import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { DEMO_ACCOUNTS } from '@/lib/auth/demo-accounts';
import { isMockDatabase } from './db-mode';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key',
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
            // Ignored when called from Server Component
          }
        },
      },
    }
  );
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('sb-auth-token')?.value;
  const userRole = cookieStore.get('sb-user-role')?.value;

  if (isMockDatabase()) {
    if (authToken === DEMO_ACCOUNTS.admin.id || userRole === 'ADMIN') {
      return DEMO_ACCOUNTS.admin;
    }
    if (authToken === DEMO_ACCOUNTS.member.id || authToken) {
      return DEMO_ACCOUNTS.member;
    }
    return null;
  }

  try {
    const supabase = await createClient();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth check timeout')), 8000)
    );
    const { data: { user }, error: authError } = await Promise.race([
      supabase.auth.getUser(),
      timeoutPromise,
    ]);

    if (authError || !user) {
      return null;
    }

    // Resolve application role from public.users table or metadata
    let appRole = user.user_metadata?.role || user.app_metadata?.role;
    let fullName = user.user_metadata?.full_name;

    try {
      let profile = null;

      // 1. Try service role admin client first for privileged role lookup
      try {
        const { createAdminClient } = await import('./admin');
        const adminClient = createAdminClient();
        if (adminClient) {
          const { data: adminProfile } = await adminClient
            .from('users')
            .select('role, full_name')
            .eq('id', user.id)
            .single();
          profile = adminProfile;
        }
      } catch {}

      // 2. Fallback to session client if admin client unavailable
      if (!profile) {
        const { data: sessionProfile } = await supabase
          .from('users')
          .select('role, full_name')
          .eq('id', user.id)
          .single();
        profile = sessionProfile;
      }

      if (profile?.role) {
        appRole = profile.role;
      }
      if (profile?.full_name) {
        fullName = profile.full_name;
      }
    } catch {}

    return {
      ...user,
      role: appRole || (user.role === 'authenticated' ? 'USER' : user.role),
      full_name: fullName || user.email,
    };
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (
    user.role === 'ADMIN' ||
    user.user_metadata?.role === 'ADMIN' ||
    user.app_metadata?.role === 'ADMIN'
  ) {
    return user;
  }

  if (isMockDatabase()) {
    throw new Error('Forbidden');
  }

  try {
    const { createAdminClient } = await import('./admin');
    const adminClient = createAdminClient();
    let profile = null;

    if (adminClient) {
      const { data } = await adminClient
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      profile = data;
    } else {
      const supabase = await createClient();
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      profile = data;
    }

    if (profile?.role === 'ADMIN') {
      return {
        ...user,
        role: 'ADMIN',
      };
    }

    throw new Error('Forbidden');
  } catch {
    throw new Error('Forbidden');
  }
}

