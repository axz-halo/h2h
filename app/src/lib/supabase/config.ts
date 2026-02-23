/**
 * Supabase 연결 여부. URL·anon key가 유효할 때만 true.
 * 미설정 시 mock 데이터 사용.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  if (!url || !key) return false;
  try {
    new URL(url);
    return key.length > 20;
  } catch {
    return false;
  }
}
