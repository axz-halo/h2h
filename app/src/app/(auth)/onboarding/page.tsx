'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

const SLIDES = [
  {
    emoji: '💕',
    title: '너의 마음은 누구에게?',
    description: '친구를 지목하면, 그 질문이 이어져요.',
    bg: 'bg-rose-50',
  },
  {
    emoji: '✉️',
    title: '마음이 통하면, 익명의 편지가 도착해요',
    description: '서로를 지목하면 특별한 일이 일어나요.',
    bg: 'bg-pink-50',
  },
  {
    emoji: '⏰',
    title: '48시간 후, 모든 것이 공개됩니다',
    description: '누가 나를 지목했을까? 두근거리는 48시간이 시작돼요.',
    bg: 'bg-rose-50/60',
  },
] as const;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const isLast = page === SLIDES.length - 1;

  const goTo = useCallback((next: number) => {
    setDirection(next > page ? 1 : -1);
    setPage(next);
  }, [page]);

  const handleNext = () => {
    if (isLast) {
      router.push(ROUTES.PERMISSIONS);
    } else {
      goTo(page + 1);
    }
  };

  const handleSkip = () => {
    router.push(ROUTES.LOGIN);
  };

  const slide = SLIDES[page];

  return (
    <div className="flex flex-col min-h-dvh px-6 pt-12 pb-8">
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col items-center text-center w-full"
          >
            <motion.div
              className={`w-32 h-32 rounded-full ${slide.bg} flex items-center justify-center mb-10`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              <span className="text-6xl" aria-hidden>
                {slide.emoji}
              </span>
            </motion.div>

            <h2 className="text-xl font-bold text-text leading-snug mb-3 whitespace-pre-line">
              {slide.title}
            </h2>
            <p className="text-base text-text-secondary leading-relaxed max-w-[280px]">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Page indicators */}
      <div className="flex justify-center gap-2 mb-8">
        {SLIDES.map((_, i) => (
          <motion.div
            key={i}
            className="h-2 rounded-full"
            animate={{
              width: i === page ? 24 : 8,
              backgroundColor: i === page ? 'var(--color-primary)' : 'var(--color-border-strong)',
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm text-text-muted px-2 py-1 active:opacity-60 transition-opacity"
        >
          건너뛰기
        </button>

        <Button size="md" onClick={handleNext}>
          {isLast ? '시작하기' : '다음'}
        </Button>
      </div>
    </div>
  );
}
