import { NextResponse } from 'next/server';
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
    // Mock: return fake challenge id and expires_at
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    return NextResponse.json({
      challenge_id: `ch-mock-${Date.now()}`,
      expires_at: expiresAt,
    });
  }

  // TODO: Supabase - insert into challenges, insert nomination with is_pass=true for first_pass_user_id
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  return NextResponse.json({
    challenge_id: `ch-${crypto.randomUUID?.() ?? Date.now()}`,
    expires_at: expiresAt,
  });
}
