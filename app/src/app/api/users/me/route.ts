import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import type { User } from '@/types';

/**
 * 현재 로그인 유저 프로필. Supabase 연동 시 upsert 후 반환.
 * 미연동 시 401.
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = authUser.email ?? '';
  const now = new Date().toISOString();

  await supabase.from('users').upsert(
    {
      id: authUser.id,
      email,
      updated_at: now,
    },
    { onConflict: 'id', ignoreDuplicates: false }
  );

  const { data: row, error: selectError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (selectError || !row) {
    return NextResponse.json(
      { error: 'Profile not found', detail: selectError?.message },
      { status: 500 }
    );
  }

  const profile: User = {
    id: String(row.id),
    email: (row as { email?: string }).email ?? email,
    phone_number: (row as { phone_number?: string }).phone_number ?? undefined,
    nickname: row.nickname ?? '',
    profile_image_url: row.profile_image_url ?? null,
    school: row.school ?? null,
    challenge_create_remaining: row.challenge_create_remaining ?? 3,
    fcm_token: row.fcm_token ?? null,
    status: row.status ?? 'active',
    created_at: row.created_at ?? now,
    updated_at: row.updated_at ?? now,
  };

  return NextResponse.json(profile);
}
