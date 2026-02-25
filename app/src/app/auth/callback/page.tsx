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
    const finish = (profile: User, goToHome: boolean) => {
      if (cancelled) return;
      setUser(profile);
      setStatus('done');
      router.replace(goToHome ? ROUTES.HOME : ROUTES.PROFILE_SETUP);
    };
    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled || !session?.user) {
        setStatus('error');
        router.replace(ROUTES.LOGIN);
        return;
      }
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' });
        if (res.ok) {
          const profile: User = await res.json();
          finish(profile, !!(profile.nickname?.trim()));
          return;
        }
      } catch {
        // fallback
      }
      const u = session.user;
      const email = u.email ?? '';
      finish(
        {
          id: String(u.id),
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
    };
    const t = setTimeout(run, 100);
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
