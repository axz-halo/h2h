'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

type Step = 'contacts' | 'push';

export default function PermissionsPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('contacts');
  const [contactsGranted, setContactsGranted] = useState(false);
  const [pushGranted, setPushGranted] = useState(false);

  const handleContactsAllow = useCallback(() => {
    setContactsGranted(true);
    setStep('push');
  }, []);

  const handlePushAllow = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setPushGranted(permission === 'granted');
    } else {
      setPushGranted(true);
    }
    router.push(ROUTES.LOGIN);
  }, [router]);

  const handleSkip = useCallback(() => {
    router.push(ROUTES.LOGIN);
  }, [router]);

  return (
    <div className="flex flex-col min-h-dvh px-6 pt-16 pb-8">
      <AnimatePresence mode="wait">
        {step === 'contacts' && (
          <motion.div
            key="contacts"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1"
          >
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-8">
                <Users className="w-10 h-10 text-primary" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-bold text-text mb-3">
                주소록 접근이 필요해요
              </h2>
              <p className="text-base text-text-secondary leading-relaxed max-w-[300px] mb-8">
                친구들을 챌린지에 초대하고, 누가 나를 지목했는지 확인하려면
                주소록 접근 권한이 필요해요.
              </p>
              <Button size="lg" onClick={handleContactsAllow} className="w-full max-w-[280px]">
                허용하기
              </Button>
            </div>
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-text-muted py-2 self-center"
            >
              나중에 하기
            </button>
          </motion.div>
        )}

        {step === 'push' && (
          <motion.div
            key="push"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1"
          >
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-8">
                <Bell className="w-10 h-10 text-primary" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-bold text-text mb-3">
                알림을 받을까요?
              </h2>
              <p className="text-base text-text-secondary leading-relaxed max-w-[300px] mb-8">
                누군가 당신을 지목하면 바로 알려드릴게요! 실시간으로 챌린지
                현황을 놓치지 마세요.
              </p>
              <Button size="lg" onClick={handlePushAllow} className="w-full max-w-[280px]">
                알림 받기
              </Button>
            </div>
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-text-muted py-2 self-center"
            >
              나중에 하기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
