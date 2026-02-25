'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { APP_NAME, ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types';

const STORAGE_KEY = 'h2h_user';
const MIN_SPLASH_MS = 1200;

export default function SplashScreen() {
  const router = useRouter();
  const { setUser, setLoading } = useAuthStore();
  const resolved = useRef(false);

  useEffect(() => {
    if (resolved.current) return;
    resolved.current = true;

    const start = Date.now();

    const navigate = (path: string) => {
      const elapsed = Date.now() - start;
      const delay = Math.max(0, MIN_SPLASH_MS - elapsed);
      setTimeout(() => router.replace(path), delay);
    };

    (async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const res = await fetch('/api/users/me', { credentials: 'include' });
          if (res.ok) {
            const profile: User = await res.json();
            setUser(profile);
            setLoading(false);
            navigate(profile.nickname?.trim() ? ROUTES.HOME : ROUTES.PROFILE_SETUP);
            return;
          }
        }
      } catch {
        // Supabase unavailable — fall through to localStorage
      }

      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (raw) {
          const user = JSON.parse(raw) as User;
          if (user?.id && user?.nickname) {
            setUser(user);
            setLoading(false);
            navigate(ROUTES.HOME);
            return;
          }
        }
      } catch {
        // ignore
      }

      setLoading(false);
      navigate(ROUTES.ONBOARDING);
    })();
  }, [router, setUser, setLoading]);

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-gradient-to-b from-rose-50 to-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Heart className="w-16 h-16 text-primary fill-primary" strokeWidth={1.5} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-2xl font-bold text-text tracking-tight flex items-center gap-2"
        >
          {APP_NAME}
          <span className="text-2xl" aria-hidden>💕</span>
        </motion.h1>
      </motion.div>
    </div>
  );
}
