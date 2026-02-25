import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { MOCK_CHALLENGES } from '@/lib/mock-data';
import type { ChallengeWithMyStatus, Question, QuestionCategory } from '@/types';

const VALID_CATEGORIES: QuestionCategory[] = ['crush', 'bestie', 'tmi', 'thanks', 'whatif', 'real'];

function mapCategory(c: string): QuestionCategory {
  return VALID_CATEGORIES.includes(c as QuestionCategory) ? (c as QuestionCategory) : 'crush';
}

/**
 * 내가 참여 중인 활성 챌린지 목록.
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(MOCK_CHALLENGES);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json([]);
  }

  const uid = user.id;
  const now = new Date().toISOString();

  const [{ data: created }, { data: nominated }] = await Promise.all([
    supabase
      .from('challenges')
      .select('id, question_id, creator_id, status, participant_count, max_participants, created_at, expires_at')
      .eq('creator_id', uid)
      .eq('status', 'active')
      .gt('expires_at', now),
    supabase
      .from('nominations')
      .select('challenge_id')
      .or(`nominator_id.eq.${uid},nominee_id.eq.${uid}`),
  ]);

  const otherIds = [...new Set((nominated ?? []).map((r) => r.challenge_id).filter(Boolean))];
  let challengesRows = created ?? [];
  if (otherIds.length > 0) {
    const { data: other } = await supabase
      .from('challenges')
      .select('id, question_id, creator_id, status, participant_count, max_participants, created_at, expires_at')
      .in('id', otherIds)
      .eq('status', 'active')
      .gt('expires_at', now);
    const seen = new Set(challengesRows.map((c) => c.id));
    other?.forEach((c) => {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        challengesRows = [...challengesRows, c];
      }
    });
  }
  if (!challengesRows.length) return NextResponse.json([]);

  const challengeIds = challengesRows.map((r) => r.id);
  const { data: nominationsRows } = await supabase
    .from('nominations')
    .select('id, challenge_id, nominator_id, nominee_id, status, is_pass')
    .in('challenge_id', challengeIds);

  const { data: questionsRows } = await supabase
    .from('questions')
    .select('id, category, question_text, is_active, usage_count, created_at')
    .in('id', [...new Set(challengesRows.map((r) => r.question_id))]);

  const questionsMap = new Map<string, Question>();
  (questionsRows ?? []).forEach((r) => {
    questionsMap.set(String(r.id), {
      id: String(r.id),
      category: mapCategory(r.category),
      question_text: r.question_text,
      is_active: r.is_active ?? true,
      usage_count: r.usage_count ?? 0,
      created_at: r.created_at ?? new Date().toISOString(),
    });
  });

  const nominationsByChallenge = new Map<string, typeof nominationsRows>();
  (nominationsRows ?? []).forEach((n) => {
    const list = nominationsByChallenge.get(n.challenge_id) ?? [];
    list.push(n);
    nominationsByChallenge.set(n.challenge_id, list);
  });

  const list: ChallengeWithMyStatus[] = [];
  for (const c of challengesRows) {
    const noms = nominationsByChallenge.get(c.id) ?? [];
    const isCreator = c.creator_id === uid;
    const pendingToMe = noms.find((n) => n.nominee_id === uid && n.status === 'pending');
    const iNominated = noms.some((n) => n.nominator_id === uid);
    const iAmNominee = noms.some((n) => n.nominee_id === uid);

    let my_status: 'my_turn' | 'completed' | 'waiting' = 'waiting';
    if (pendingToMe) my_status = 'my_turn';
    else if (isCreator || iNominated) my_status = 'completed';
    else if (iAmNominee) my_status = 'waiting';

    const my_role = isCreator ? 'host' : iAmNominee || iNominated ? 'participant' : undefined;
    const orderNoms = noms.filter((n) => n.nominator_id === uid || (n.is_pass && n.nominee_id === uid));
    const my_participant_order = orderNoms.length > 0 ? orderNoms.length : undefined;

    const question = questionsMap.get(String(c.question_id));
    list.push({
      id: String(c.id),
      question_id: String(c.question_id),
      question,
      creator_id: String(c.creator_id),
      status: c.status as 'active' | 'expired' | 'result_delivered',
      participant_count: c.participant_count ?? 1,
      max_participants: c.max_participants ?? 30,
      created_at: c.created_at ?? new Date().toISOString(),
      expires_at: c.expires_at ?? new Date().toISOString(),
      my_status,
      my_role,
      my_participant_order,
      participant_display: `${c.participant_count}명 참여 중`,
    });
  }

  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return NextResponse.json(list);
}
