'use client';

import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Flag, User } from 'lucide-react';
import { AppBar } from '@/components/layout/app-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { MOCK_LETTERS } from '@/lib/mock-data';
import { formatPrice } from '@/lib/utils';
import { PRICE_REVEAL_ONE, PRICE_REVEAL_ALL } from '@/lib/constants';

export default function LetterDetailPage() {
  const params = useParams();
  const letterId = params.id as string;

  const letter = useMemo(
    () => MOCK_LETTERS.find((l) => l.id === letterId) ?? MOCK_LETTERS[0],
    [letterId]
  );

  const [isRevealed, setIsRevealed] = useState(letter.is_revealed);
  const [revealedSender, setRevealedSender] = useState(letter.sender ?? null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'one' | 'all'>('one');
  const [isPaying, setIsPaying] = useState(false);

  const handlePay = useCallback(async () => {
    setIsPaying(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsRevealed(true);
    setRevealedSender({ id: 'user-3', nickname: '민서', profile_image_url: null } as typeof revealedSender);
    setSheetOpen(false);
    setIsPaying(false);
  }, []);

  return (
    <div className="min-h-dvh bg-bg">
      <AppBar
        showBack
        title="편지"
        rightAction={
          <button className="p-1.5 rounded-full hover:bg-surface transition-colors cursor-pointer">
            <Flag size={18} className="text-text-muted" />
          </button>
        }
      />

      <motion.div
        className="px-5 pt-4 pb-8 flex flex-col gap-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex flex-col items-center gap-3 pt-2">
          <AnimatePresence mode="wait">
            {isRevealed && revealedSender ? (
              <motion.div
                key="revealed"
                className="flex flex-col items-center gap-2"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={28} className="text-primary" />
                </div>
                <p className="text-base font-bold text-text">{revealedSender.nickname}</p>
              </motion.div>
            ) : (
              <motion.div
                key="anonymous"
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center">
                  <HelpCircle size={28} className="text-text-muted" />
                </div>
                <p className="text-base font-medium text-text-secondary">익명의 누군가</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Card className="p-6">
          <div
            className="text-[15px] text-text leading-[1.8] whitespace-pre-wrap"
            style={{
              backgroundImage:
                'repeating-linear-gradient(transparent, transparent 31px, #F1F5F9 31px, #F1F5F9 32px)',
              backgroundPosition: '0 4px',
            }}
          >
            {letter.content}
          </div>
        </Card>

        {!isRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button fullWidth size="lg" onClick={() => setSheetOpen(true)}>
              이 사람이 궁금하다면?
            </Button>
          </motion.div>
        )}
      </motion.div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <h3 className="text-lg font-bold text-text text-center mb-6">
          이 편지를 쓴 사람이 궁금하다면?
        </h3>

        <div className="flex flex-col gap-3 mb-6">
          <button
            className={`relative p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              selectedOption === 'one'
                ? 'border-primary bg-primary/5'
                : 'border-border-strong bg-white'
            }`}
            onClick={() => setSelectedOption('one')}
          >
            <p className="text-[15px] font-semibold text-text">이 사람만 확인하기</p>
            <p className="text-lg font-bold text-primary mt-1">{formatPrice(PRICE_REVEAL_ONE)}</p>
          </button>

          <button
            className={`relative p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              selectedOption === 'all'
                ? 'border-primary bg-primary/5'
                : 'border-border-strong bg-white'
            }`}
            onClick={() => setSelectedOption('all')}
          >
            <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
              가장 인기!
            </span>
            <p className="text-[15px] font-semibold text-text">모든 작성자 확인하기</p>
            <p className="text-lg font-bold text-primary mt-1">{formatPrice(PRICE_REVEAL_ALL)}</p>
          </button>
        </div>

        <Button fullWidth size="lg" loading={isPaying} onClick={handlePay}>
          결제하기
        </Button>
      </BottomSheet>
    </div>
  );
}
