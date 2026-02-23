'use client';

import { useState, useEffect, useMemo } from 'react';
import { MOCK_FRIENDS } from '@/lib/mock-data';
import type { Friend } from '@/types';

export function useFriends(search = ''): { friends: Friend[]; loading: boolean } {
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const q = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
    fetch(`/api/friends${q}`)
      .then((res) => res.json())
      .then((data: Friend[]) => {
        if (!cancelled && Array.isArray(data)) setFriends(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search]);

  return { friends, loading };
}
