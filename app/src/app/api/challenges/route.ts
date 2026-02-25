import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * v2.1: 챌린지 생성 (Host가 질문을 넘길 1명 지정).
 * Body: { question_id: string, first_pass_user_id: string }
 * Response: { challenge_id: string, expires_at: string }
 */
export async function POST(request: Request) {
  if (request.headers.get('content-type')?.includes('application/json') === false) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 400 });
  }

  let body: { question_id?: string; first_pass_user_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { question_id, first_pass_user_id } = body;
  if (!question_id || !first_pass_user_id) {
    return NextResponse.json(
      { error: 'question_id and first_pass_user_id are required' },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    return NextResponse.json({
      challenge_id: `ch-mock-${Date.now()}`,
      expires_at: expiresAt,
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

  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  const { data: challenge, error: insertChError } = await supabase
    .from('challenges')
    .insert({
      question_id,
      creator_id: user.id,
      status: 'active',
      participant_count: 1,
      expires_at: expiresAt,
      max_participants: 30,
    })
    .select('id')
    .single();

  if (insertChError || !challenge) {
    console.error('[api/challenges] insert challenge', insertChError);
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
  }

  const { error: insertNomError } = await supabase.from('nominations').insert({
    challenge_id: challenge.id,
    nominator_id: user.id,
    nominee_id: first_pass_user_id,
    is_pass: true,
    is_mutual: false,
    chain_order: 1,
    status: 'pending',
  });

  if (insertNomError) {
    console.error('[api/challenges] insert nomination', insertNomError);
    return NextResponse.json({ error: 'Failed to create pass nomination' }, { status: 500 });
  }

  return NextResponse.json({
    challenge_id: String(challenge.id),
    expires_at: expiresAt,
  });
}
