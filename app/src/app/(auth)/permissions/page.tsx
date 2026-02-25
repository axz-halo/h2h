'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export default function PermissionsPage() {
  const router = useRouter();

  const handleAllow = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      await Notification.requestPermission();
    }
    router.push(ROUTES.LOGIN);
  }, [router]);

  const handleSkip = useCallback(() => {
    router.push(ROUTES.LOGIN);
  }, [router]);

  return (
    <div className="flex flex-col min-h-dvh px-6 pt-16 pb-8 bg-gradient-to-b from-rose-50/50 to-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col flex-1"
      >
        <div className="flex-1 flex flex-col items-center text-center">
          <motion.div
            className="w-28 h-28 rounded-full bg-rose-50 flex items-center justify-center mb-8 border border-rose-100 shadow-sm"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            <span className="text-6xl select-none" aria-hidden>🔔</span>
          </motion.div>

          <h2 className="text-xl font-bold text-text mb-3">
            알림을 받을까요?
          </h2>
          <p className="text-base text-text-secondary leading-relaxed max-w-[300px] mb-2">
            누군가 당신을 지목하면 바로 알려드릴게요!
          </p>
          <p className="text-sm text-text-muted mb-8">
            실시간 챌린지 현황을 놓치지 마세요 ✨
          </p>

          <Button size="lg" onClick={handleAllow} className="w-full max-w-[280px]">
            알림 받기
          </Button>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="text-sm text-text-muted py-2 self-center hover:text-text-secondary transition-colors cursor-pointer"
        >
          나중에 하기
        </button>
      </motion.div>
    </div>
  );
}
