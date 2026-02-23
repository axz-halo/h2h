'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import { MOCK_USER } from '@/lib/mock-data';
import { ROUTES } from '@/lib/constants';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setPendingChallengeId } = useAuthStore();

  useEffect(() => {
    const challengeId = searchParams.get('challenge_id');
    if (challengeId) setPendingChallengeId(challengeId);
  }, [searchParams, setPendingChallengeId]);

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEmailValid = EMAIL_REGEX.test(email.trim());

  const handleSendLink = async () => {
    if (!isEmailValid) return;
    setLoading(true);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabase = supabaseUrl && supabaseUrl !== 'your-supabase-url';
    if (hasSupabase) {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}${ROUTES.AUTH_CALLBACK}` : undefined,
          },
        });
        if (!error) setSent(true);
      } catch {
        setSent(false);
      }
    } else {
      setUser({ ...MOCK_USER, email: email.trim() });
      router.push(ROUTES.PROFILE_SETUP);
    }
    setLoading(false);
  };

  const handleBack = () => setSent(false);

  return (
    <div className="flex flex-col min-h-dvh px-6 pt-4 pb-8">
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            <h1 className="text-2xl font-bold text-text mt-4 mb-2">
              이메일로 시작하기
            </h1>
            <p className="text-sm text-text-muted mb-8">
              로그인 링크를 보내드려요
            </p>

            <Input
              type="email"
              inputMode="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-auto"
              autoFocus
            />

            <Button
              fullWidth
              size="lg"
              disabled={!isEmailValid || loading}
              loading={loading}
              onClick={handleSendLink}
              className="mt-6"
            >
              로그인 링크 받기
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="sent"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            <h1 className="text-2xl font-bold text-text mt-4 mb-2">
              이메일을 확인해주세요
            </h1>
            <p className="text-sm text-text-muted mb-8">
              <span className="font-medium text-text">{email}</span>로 보낸 링크를 클릭하면 로그인됩니다.
            </p>

            <div className="flex-1" />

            <button
              type="button"
              onClick={handleBack}
              className="text-sm text-text-muted underline underline-offset-2 py-2"
            >
              다른 이메일로 다시 시도
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh flex items-center justify-center bg-bg" />}>
      <LoginForm />
    </Suspense>
  );
}
