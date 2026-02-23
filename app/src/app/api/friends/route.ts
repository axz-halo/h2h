import { NextRequest, NextResponse } from 'next/server';
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

  // TODO: Supabase에서 현재 유저의 contacts + matched users 조회
  const list = !search
    ? MOCK_FRIENDS
    : MOCK_FRIENDS.filter((f) => f.nickname.toLowerCase().includes(search));
  return NextResponse.json(list);
}
