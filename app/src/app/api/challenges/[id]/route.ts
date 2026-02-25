import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * 단일 챌린지 조회 + 참여자 ID 목록 (지목 페이지용).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: challengeId } = await params;
  if (!challengeId) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      id: challengeId,
      participant_count: 0,
      max_participants: 30,
      participant_ids: [],
    });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: challenge, error: chError } = await supabase
    .from('challenges')
    .select('id, participant_count, max_participants, status')
    .eq('id', challengeId)
    .single();
  if (chError || !challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
  }

  const { data: noms } = await supabase
    .from('nominations')
    .select('nominator_id, nominee_id')
    .eq('challenge_id', challengeId);
  const participantIds = [...new Set((noms ?? []).flatMap((n) => [n.nominator_id, n.nominee_id]).filter(Boolean))];

  return NextResponse.json({
    id: String(challenge.id),
    participant_count: challenge.participant_count ?? 0,
    max_participants: challenge.max_participants ?? 30,
    status: challenge.status,
    participant_ids: participantIds,
  });
}
