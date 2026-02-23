import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { MOCK_CHALLENGES } from '@/lib/mock-data';

/**
 * 내가 참여 중인 활성 챌린지 목록.
 * Supabase 연동 시: auth 기반으로 challenges + my_status 등 조회.
 * 미연동 시: mock 반환.
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(MOCK_CHALLENGES);
  }

  // TODO: Supabase에서 현재 유저의 챌린지 목록 조회 (auth.uid() 기반)
  // const supabase = await createServerSupabaseClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) return NextResponse.json([]);
  // ... from challenges + nominations 조인
  return NextResponse.json(MOCK_CHALLENGES);
}
