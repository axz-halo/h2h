'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Bell, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppBar } from '@/components/layout/app-bar';
import { Button } from '@/components/ui/button';
import { ChallengeCard } from '@/components/challenge/challenge-card';
import { useAuthStore } from '@/stores/auth-store';
import { useToastStore } from '@/stores/toast-store';
import { useChallenges } from '@/hooks/use-challenges';
import { MOCK_USER } from '@/lib/mock-data';
import { ROUTES, MAX_CHALLENGE_CREATE } from '@/lib/constants';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const { challenges, loading } = useChallenges();
  const remaining = user?.challenge_create_remaining ?? MOCK_USER.challenge_create_remaining;
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [notificationDenied, setNotificationDenied] = useState(false);
  const hasChallenges = challenges.length > 0;

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied') {
      setNotificationDenied(true);
      setShowNotificationBanner(true);
    }
  }, []);

  const goToNewChallenge = () => {
    if (remaining <= 0) {
      addToast('이미 3번의 챌린지를 모두 사용했어요. 친구가 시작한 챌린지에 참여해보세요!', 'info');
      return;
    }
    router.push(ROUTES.CHALLENGE_NEW);
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <AppBar showLogo showSettings />

      {showNotificationBanner && notificationDenied && (
        <div className="mx-4 mt-2 flex items-start gap-3 rounded-[14px] bg-surface border border-border-strong p-3">
          <Bell size={18} className="text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text">
              알림을 켜면 누군가 당신을 지목했을 때 바로 알 수 있어요!
            </p>
            <button
              type="button"
              onClick={() => window.open('/mypage', '_self')}
              className="text-xs text-primary font-semibold mt-1 underline underline-offset-1"
            >
              설정에서 알림 허용하기
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowNotificationBanner(false)}
            className="p-1 rounded-full hover:bg-white/50 transition-colors cursor-pointer shrink-0"
          >
            <X size={16} className="text-text-muted" />
          </button>
        </div>
      )}

      <main className="flex-1 px-4 pb-4">
        {hasChallenges ? (
          <motion.div
            className="flex flex-col gap-3 pt-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07 } },
            }}
          >
            {challenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </motion.div>
        ) : (
          <EmptyState onStart={goToNewChallenge} remaining={remaining} />
        )}
      </main>

      {hasChallenges && (
        <div className="fixed bottom-20 right-0 left-0 z-30 pointer-events-none">
          <div className="max-w-md mx-auto px-4 flex justify-end">
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
              disabled={remaining <= 0}
              onClick={goToNewChallenge}
              className={
                'pointer-events-auto flex items-center gap-2 h-12 pl-4 pr-5 rounded-full shadow-[var(--shadow-lg)] ' +
                'bg-primary text-white font-semibold text-sm transition-all active:scale-95 cursor-pointer ' +
                'disabled:opacity-40 disabled:cursor-not-allowed mb-2'
              }
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>새 챌린지 ({remaining}/{MAX_CHALLENGE_CREATE})</span>
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({
  onStart,
  remaining,
}: {
  onStart: () => void;
  remaining: number;
}) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center flex-1 min-h-[60dvh]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <motion.div
        className="w-24 h-24 rounded-full bg-surface flex items-center justify-center mb-5"
        animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 0.5 }}
      >
        <span className="text-5xl" aria-hidden>
          💝
        </span>
      </motion.div>

      <p className="text-lg font-bold text-text mb-1">
        아직 진행 중인 챌린지가 없어요
      </p>
      <p className="text-sm text-text-muted mb-8 leading-relaxed">
        마음을 전할 친구를 지목해보세요 ✨
      </p>

      <Button size="lg" onClick={onStart} disabled={remaining <= 0}>
        새 챌린지 시작하기 ({remaining}/{MAX_CHALLENGE_CREATE})
      </Button>
    </motion.div>
  );
}
