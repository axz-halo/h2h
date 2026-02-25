'use client';

import { useState, useEffect } from 'react';
import { MOCK_CHALLENGES } from '@/lib/mock-data';
import type { ChallengeWithMyStatus } from '@/types';

export function useChallenges(): {
  challenges: ChallengeWithMyStatus[];
  loading: boolean;
  refetch: () => void;
} {
  const [challenges, setChallenges] = useState<ChallengeWithMyStatus[]>(MOCK_CHALLENGES);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = () => {
    setLoading(true);
    fetch('/api/challenges/active')
      .then((res) => res.json())
      .then((data: ChallengeWithMyStatus[]) => {
        if (Array.isArray(data)) setChallenges(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(fetchChallenges, 0);
    return () => clearTimeout(t);
  }, []);

  return { challenges, loading, refetch: fetchChallenges };
}
