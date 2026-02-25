import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import type { User } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProfile(row: any, fallbackEmail = ''): User {
  return {
    id: String(row.id),
    email: row.email ?? fallbackEmail,
    phone_number: row.phone_number ?? undefined,
    nickname: row.nickname ?? '',
    profile_image_url: row.profile_image_url ?? null,
    school: row.school ?? null,
    challenge_create_remaining: row.challenge_create_remaining ?? 3,
    fcm_token: row.fcm_token ?? null,
    status: row.status ?? 'active',
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? new Date().toISOString(),
  };
}

async function getAuthUser() {
  if (!isSupabaseConfigured()) return { supabase: null, authUser: null };
  const supabase = await createServerSupabaseClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  return { supabase, authUser };
}

export async function GET() {
  const { supabase, authUser } = await getAuthUser();
  if (!supabase || !authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = authUser.email ?? '';
  const now = new Date().toISOString();

  await supabase.from('users').upsert(
    { id: authUser.id, email, updated_at: now },
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

  return NextResponse.json(rowToProfile(row, email));
}

export async function PATCH(request: NextRequest) {
  const { supabase, authUser } = await getAuthUser();
  if (!supabase || !authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { nickname, school } = body as { nickname?: string; school?: string };

  if (!nickname || typeof nickname !== 'string' || nickname.trim().length < 2) {
    return NextResponse.json({ error: 'nickname is required (min 2 chars)' }, { status: 400 });
  }

  const updates: Record<string, string> = {
    nickname: nickname.trim(),
    updated_at: new Date().toISOString(),
  };
  if (typeof school === 'string') {
    updates.school = school.trim() || '';
  }

  const { error: updateError } = await supabase
    .from('users')
    .update(updates)
    .eq('id', authUser.id);

  if (updateError) {
    return NextResponse.json(
      { error: 'Failed to update profile', detail: updateError.message },
      { status: 500 }
    );
  }

  const { data: row, error: selectError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (selectError || !row) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 500 });
  }

  return NextResponse.json(rowToProfile(row, authUser.email));
}
