/**
 * Helper to determine if the application is running in mock/local fallback mode
 * (i.e. Supabase credentials have not been configured with a real live database URL).
 */
export function isMockDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes('placeholder') || url.includes('example.com') || url.includes('localhost:54321')) {
    return process.env.NODE_ENV !== 'production';
  }
  return false;
}
