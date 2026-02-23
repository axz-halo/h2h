'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import { ROUTES } from '@/lib/constants';
import type { User } from '@/types';

export default function AuthCallbackPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    const authUserEmail = (u: { email?: string | null }) => u.email ?? '';
    const finishWithProfile = (profile: User, goToHome: boolean) => {
      if (cancelled) return;
      setUser(profile);
      setStatus('done');
      router.replace(goToHome ? ROUTES.HOME : ROUTES.PROFILE_SETUP);
    };
    const resolveSession = () =>
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (cancelled || !session?.user) {
          setStatus('error');
          router.replace(ROUTES.LOGIN);
          return;
        }
        const authUser = session.user;
        const email = authUserEmail(authUser);
        try {
          const { data: row } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();
          const profile: User = row
            ? {
                id: String(row.id),
                email: (row as { email?: string }).email ?? email,
                phone_number: (row as { phone_number?: string }).phone_number ?? undefined,
                nickname: row.nickname ?? '',
                profile_image_url: row.profile_image_url ?? null,
                school: row.school ?? null,
                challenge_create_remaining: row.challenge_create_remaining ?? 3,
                fcm_token: row.fcm_token ?? null,
                status: row.status ?? 'active',
                created_at: row.created_at ?? new Date().toISOString(),
                updated_at: row.updated_at ?? new Date().toISOString(),
              }
            : {
                id: String(authUser.id),
                email,
                nickname: '',
                profile_image_url: null,
                school: null,
                challenge_create_remaining: 3,
                fcm_token: null,
                status: 'active' as const,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
          finishWithProfile(profile, !!row?.nickname);
        } catch {
          finishWithProfile(
            {
              id: String(authUser.id),
              email,
              nickname: '',
              profile_image_url: null,
              school: null,
              challenge_create_remaining: 3,
              fcm_token: null,
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            false
          );
        }
      });
    const t = setTimeout(resolveSession, 100);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [router, setUser]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-bg">
      <p className="text-text-muted text-sm">
        {status === 'loading' && '로그인 처리 중...'}
        {status === 'done' && '이동 중...'}
        {status === 'error' && '로그인에 실패했어요.'}
      </p>
    </div>
  );
}
