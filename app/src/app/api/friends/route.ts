import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { MOCK_FRIENDS } from '@/lib/mock-data';
import type { Friend } from '@/types';

/**
 * 친구 목록 (주소록 매칭 + 앱 가입 유저).
 * query: search (이름 검색)
 * Supabase 연동 시: contacts + users 조인.
 * 미연동 시: mock 반환.
 */
export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search')?.trim().toLowerCase() ?? '';

  if (!isSupabaseConfigured()) {
    const list = !search
      ? MOCK_FRIENDS
      : MOCK_FRIENDS.filter((f) => f.nickname.toLowerCase().includes(search));
    return NextResponse.json(list);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json([]);
  }

  const { data: contactRows } = await supabase
    .from('contacts')
    .select('matched_user_id')
    .eq('user_id', user.id)
    .not('matched_user_id', 'is', null);
  const matchedIds = [...new Set((contactRows ?? []).map((r) => r.matched_user_id).filter(Boolean))];

  let userIds = matchedIds;
  if (userIds.length === 0) {
    const { data: allUsers } = await supabase.from('users').select('id').neq('id', user.id);
    userIds = (allUsers ?? []).map((r) => r.id);
  }

  if (userIds.length === 0) {
    return NextResponse.json([]);
  }

  const { data: rows } = await supabase
    .from('users')
    .select('id, nickname, profile_image_url')
    .in('id', userIds)
    .not('nickname', 'is', null);

  let list: Friend[] = (rows ?? []).map((r) => ({
    id: String(r.id),
    nickname: r.nickname ?? '',
    profile_image_url: r.profile_image_url ?? null,
    is_app_user: true,
  }));

  if (search) {
    list = list.filter((f) => f.nickname.toLowerCase().includes(search));
  }
  return NextResponse.json(list);
}
