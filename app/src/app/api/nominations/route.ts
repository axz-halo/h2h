import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * 지목 생성. Body: { challenge_id: string, nominee_id: string }
 * Response: { nomination_id: string, is_mutual: boolean }
 */
export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 400 });
  }

  let body: { challenge_id?: string; nominee_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { challenge_id, nominee_id } = body;
  if (!challenge_id || !nominee_id) {
    return NextResponse.json({ error: 'challenge_id and nominee_id required' }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ nomination_id: `nom-mock-${Date.now()}`, is_mutual: nominee_id === 'user-3' });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: challenge } = await supabase
    .from('challenges')
    .select('id, participant_count, max_participants, status')
    .eq('id', challenge_id)
    .single();
  if (!challenge || challenge.status !== 'active') {
    return NextResponse.json({ error: 'Challenge not found or not active' }, { status: 404 });
  }
  if ((challenge.participant_count ?? 0) >= (challenge.max_participants ?? 30)) {
    return NextResponse.json({ error: 'Challenge is full' }, { status: 400 });
  }

  const { data: pendingToMe } = await supabase
    .from('nominations')
    .select('id')
    .eq('challenge_id', challenge_id)
    .eq('nominee_id', user.id)
    .eq('status', 'pending')
    .maybeSingle();

  const { data: maxOrder } = await supabase
    .from('nominations')
    .select('chain_order')
    .eq('challenge_id', challenge_id)
    .order('chain_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (maxOrder?.chain_order ?? 0) + 1;

  if (pendingToMe) {
    await supabase
      .from('nominations')
      .update({ status: 'completed' })
      .eq('id', pendingToMe.id);
  }

  const { data: newNom, error: insertErr } = await supabase
    .from('nominations')
    .insert({
      challenge_id,
      nominator_id: user.id,
      nominee_id,
      is_pass: false,
      is_mutual: false,
      chain_order: nextOrder,
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertErr || !newNom) {
    console.error('[api/nominations]', insertErr);
    return NextResponse.json({ error: 'Failed to create nomination' }, { status: 500 });
  }

  await supabase
    .from('challenges')
    .update({ participant_count: (challenge.participant_count ?? 1) + 1 })
    .eq('id', challenge_id);

  const { data: mutualRow } = await supabase
    .from('nominations')
    .select('id')
    .eq('challenge_id', challenge_id)
    .eq('nominator_id', nominee_id)
    .eq('nominee_id', user.id)
    .eq('status', 'completed')
    .maybeSingle();

  return NextResponse.json({
    nomination_id: String(newNom.id),
    is_mutual: !!mutualRow,
  });
}
