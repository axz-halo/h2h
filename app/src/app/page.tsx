'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth-store';
import { ROUTES } from '@/lib/constants';
import type { User } from '@/types';

const STORAGE_KEY = 'h2h_user';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const user = JSON.parse(raw) as User;
        if (user?.id && user?.nickname) setUser(user);
      }
    } catch (_) {}
    setLoading(false);
  }, [setUser, setLoading]);

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      router.replace(isAuthenticated ? ROUTES.HOME : ROUTES.ONBOARDING);
    }, 1500);
    return () => clearTimeout(timer);
  }, [router, isAuthenticated, isLoading]);

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
