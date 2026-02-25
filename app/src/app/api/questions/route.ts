import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { MOCK_QUESTIONS } from '@/lib/mock-data';
import type { Question } from '@/types';
import type { QuestionCategory } from '@/types';

const VALID_CATEGORIES: QuestionCategory[] = ['crush', 'bestie', 'tmi', 'thanks', 'whatif', 'real'];

function mapCategory(category: string): QuestionCategory {
  return VALID_CATEGORIES.includes(category as QuestionCategory)
    ? (category as QuestionCategory)
    : 'crush';
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(MOCK_QUESTIONS);
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('questions')
      .select('id, category, question_text, is_active, usage_count, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[api/questions]', error);
      return NextResponse.json(MOCK_QUESTIONS);
    }

    const questions: Question[] = (data ?? []).map((row) => ({
      id: String(row.id),
      category: mapCategory(row.category),
      question_text: row.question_text,
      is_active: row.is_active ?? true,
      usage_count: row.usage_count ?? 0,
      created_at: row.created_at ?? new Date().toISOString(),
    }));

    return NextResponse.json(questions);
  } catch (e) {
    console.error('[api/questions]', e);
    return NextResponse.json(MOCK_QUESTIONS);
  }
}
