'use client';

import { useState, useEffect } from 'react';
import { MOCK_QUESTIONS } from '@/lib/mock-data';
import type { Question } from '@/types';

export function useQuestions(): { questions: Question[]; loading: boolean } {
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/questions')
      .then((res) => res.json())
      .then((data: Question[]) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setQuestions(data);
        }
      })
      .catch(() => {
        // keep MOCK_QUESTIONS on error
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { questions, loading };
}
