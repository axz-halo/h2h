'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HelpCircle, Mail } from 'lucide-react';
import { AppBar } from '@/components/layout/app-bar';
import { Card } from '@/components/ui/card';
import { MOCK_LETTERS } from '@/lib/mock-data';
import { truncateText, getRelativeTime } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

export default function ResultsPage() {
  const router = useRouter();
  const letters = MOCK_LETTERS;

  return (
    <div className="min-h-dvh bg-bg">
      <AppBar title="나의 보관함" />

      <div className="px-5 pt-3 pb-8">
        {letters.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center pt-32 text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-5">
              <Mail size={28} className="text-text-muted" />
            </div>
            <p className="text-text-secondary text-[15px] leading-relaxed max-w-[240px]">
              아직 도착한 편지가 없어요.
              <br />
              챌린지에 참여하면 특별한 편지를 받을 수 있어요!
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            {letters.map((letter, i) => (
              <motion.div
                key={letter.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
              >
                <Card
                  interactive
                  className="p-4"
                  onClick={() => router.push(ROUTES.RESULT_DETAIL(letter.id))}
                >
                  <div className="flex gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-surface flex-shrink-0 flex items-center justify-center">
                      {letter.is_revealed && letter.sender ? (
                        <span className="text-sm font-bold text-primary">
                          {letter.sender.nickname.charAt(0)}
                        </span>
                      ) : (
                        <HelpCircle size={20} className="text-text-muted" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">
                        {letter.challenge_question}
                      </p>
                      <p className="text-[13px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                        {truncateText(letter.content, 60)}
                      </p>
                      <p className="text-xs text-text-muted mt-1.5">
                        {getRelativeTime(letter.created_at)}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
