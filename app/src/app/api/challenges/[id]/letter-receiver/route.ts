import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * 이 챌린지에서 내가 편지를 쓸 대상(나를 지목한 사람). pending nomination의 nominator.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: challengeId } = await params;
  if (!challengeId) {
    return NextResponse.json({ error: 'challenge_id required' }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ receiver_id: 'user-3', receiver_name: '민서' });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: nom } = await supabase
    .from('nominations')
    .select('nominator_id')
    .eq('challenge_id', challengeId)
    .eq('nominee_id', user.id)
    .eq('status', 'pending')
    .maybeSingle();
  if (!nom) {
    return NextResponse.json({ error: 'No pending nomination' }, { status: 404 });
  }

  const { data: receiver } = await supabase
    .from('users')
    .select('id, nickname')
    .eq('id', nom.nominator_id)
    .single();

  if (!receiver) {
    return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
  }

  return NextResponse.json({
    receiver_id: String(receiver.id),
    receiver_name: receiver.nickname ?? '',
  });
}
