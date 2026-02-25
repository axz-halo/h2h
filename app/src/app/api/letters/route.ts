import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

/**
 * 편지 생성. Body: { challenge_id: string, receiver_id: string, content: string }
 * nomination_id는 서버에서 조회 (nominee=me, nominator=receiver).
 */
export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 400 });
  }

  let body: { challenge_id?: string; nomination_id?: string; receiver_id?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { challenge_id, nomination_id, receiver_id, content } = body;
  if (!challenge_id || !receiver_id || typeof content !== 'string') {
    return NextResponse.json(
      { error: 'challenge_id, receiver_id, content required' },
      { status: 400 }
    );
  }
  const trimmed = content.trim();
  if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) {
    return NextResponse.json(
      { error: `content length must be between ${MIN_LENGTH} and ${MAX_LENGTH}` },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ letter_id: `letter-mock-${Date.now()}` });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let nomId = nomination_id;
  if (!nomId) {
    const { data: nom } = await supabase
      .from('nominations')
      .select('id')
      .eq('challenge_id', challenge_id)
      .eq('nominee_id', user.id)
      .eq('nominator_id', receiver_id)
      .maybeSingle();
    nomId = nom?.id;
  }
  if (!nomId) {
    return NextResponse.json({ error: 'Nomination not found for this letter' }, { status: 404 });
  }

  const { error: insertErr } = await supabase.from('letters').insert({
    challenge_id,
    nomination_id: nomId,
    sender_id: user.id,
    receiver_id,
    content: trimmed,
    is_revealed: false,
    is_reported: false,
    is_blinded: false,
  });

  if (insertErr) {
    console.error('[api/letters]', insertErr);
    return NextResponse.json({ error: 'Failed to create letter' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
