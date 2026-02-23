'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

function FloatingHeart({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      className="absolute text-primary/60"
      initial={{ y: '100vh', x, opacity: 0, scale: 0 }}
      animate={{ y: '-20vh', opacity: [0, 1, 1, 0], scale: [0, 1, 1, 0.5] }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    >
      <Heart size={size} fill="currentColor" />
    </motion.div>
  );
}

export default function MutualCelebrationPage() {
  const router = useRouter();
  const params = useParams();
  const challengeId = params.id as string;
  const matchedName = '민서';

  const navigateToLetter = useCallback(() => {
    router.push(ROUTES.CHALLENGE_LETTER(challengeId));
  }, [router, challengeId]);

  useEffect(() => {
    const timer = setTimeout(navigateToLetter, 3000);
    return () => clearTimeout(timer);
  }, [navigateToLetter]);

  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        delay: i * 0.3,
        x: Math.random() * 320 - 160,
        size: 12 + Math.random() * 16,
      })),
    []
  );

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #FFE4E6 0%, #FFF1F2 50%, #FFFBFB 100%)' }}
      onClick={navigateToLetter}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {particles.map((p) => (
        <FloatingHeart key={p.id} delay={p.delay} x={p.x} size={p.size} />
      ))}

      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Heart size={80} className="text-primary" fill="currentColor" />
        </motion.div>
      </motion.div>

      <motion.p
        className="mt-8 text-xl font-bold text-text text-center px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {matchedName}님과 마음이 통했어요!
      </motion.p>

      <motion.p
        className="mt-3 text-sm text-text-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        탭하면 편지 쓰기로 넘어가요
      </motion.p>
    </motion.div>
  );
}
