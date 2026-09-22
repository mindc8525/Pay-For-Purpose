import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { DEMO_ACCOUNTS } from '@/lib/auth/demo-accounts';
import { isMockDatabase } from './db-mode';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  if (authToken === DEMO_ACCOUNTS.admin.id || userRole === 'ADMIN') {
    return DEMO_ACCOUNTS.admin;
  }
  if (authToken === DEMO_ACCOUNTS.member.id || (isMockDatabase() && authToken)) {
    return DEMO_ACCOUNTS.member;
  }

  if (isMockDatabase()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth check timeout')), 1500)
    );
    const { data: { user } } = await Promise.race([
      supabase.auth.getUser(),
      timeoutPromise,
    ]);
    return user;
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

  if (user.role === 'ADMIN' || user.user_metadata?.role === 'ADMIN') {
    return user;
  }

  if (isMockDatabase()) {
    throw new Error('Forbidden');
  }

  try {
    const supabase = await createClient();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Admin check timeout')), 1500)
    );
    const { data: profile } = await Promise.race([
      supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single(),
      timeoutPromise,
    ]);

    if (!profile || profile.role !== 'ADMIN') {
      throw new Error('Forbidden');
    }

    return user;
  } catch {
    throw new Error('Forbidden');
  }
}

