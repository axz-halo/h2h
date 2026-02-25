'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { AppBar } from '@/components/layout/app-bar';
import { Button } from '@/components/ui/button';
import { useChallengeStore } from '@/stores/challenge-store';
import { useQuestions } from '@/hooks/use-questions';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { QuestionCategory } from '@/types';
import { CATEGORY_MAP } from '@/types';

type FilterTab = 'all' | QuestionCategory;

const TABS: { key: FilterTab; label: string; icon?: string; color?: string }[] = [
  { key: 'all', label: '전체' },
  ...Object.entries(CATEGORY_MAP).map(([key, val]) => ({
    key: key as QuestionCategory,
    label: val.emoji,
    icon: val.icon,
    color: val.color,
  })),
];

export default function QuestionSelectPage() {
  const router = useRouter();
  const { selectedQuestion, setSelectedQuestion } = useChallengeStore();
  const { questions } = useQuestions();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filtered = useMemo(
    () =>
      activeTab === 'all'
        ? questions
        : questions.filter((q) => q.category === activeTab),
    [activeTab, questions]
  );

  const handleNext = () => {
    if (!selectedQuestion) return;
    router.push(ROUTES.CHALLENGE_INVITE);
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <AppBar showBack title="어떤 질문으로 시작할까요?" />

      <div className="px-4 pt-2 pb-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'shrink-0 px-4 h-9 rounded-full text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5',
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface text-text-secondary hover:bg-surface-hover'
                )}
                style={
                  isActive && tab.color
                    ? { backgroundColor: tab.color }
                    : undefined
                }
              >
                {tab.icon && <span className="text-sm">{tab.icon}</span>}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1 px-4 pb-28 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeTab}
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {filtered.map((question) => {
              const isSelected = selectedQuestion?.id === question.id;
              const cat = CATEGORY_MAP[question.category];

              return (
                <motion.div
                  key={question.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedQuestion(question)}
                    className={cn(
                      'w-full text-left rounded-2xl p-4 transition-all cursor-pointer',
                      'flex items-center gap-4',
                      isSelected
                        ? 'ring-2 ring-primary shadow-md'
                        : 'ring-1 ring-black/5 hover:ring-black/10'
                    )}
                    style={{
                      background: isSelected ? cat.gradient : undefined,
                    }}
                  >
                    <div
                      className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: cat.gradient }}
                    >
                      {cat.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-[15px] leading-snug break-keep',
                          isSelected ? 'font-bold text-text' : 'font-medium text-text'
                        )}
                      >
                        {question.question_text}
                      </p>
                      <span
                        className="inline-block mt-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          color: cat.color,
                          backgroundColor: cat.color + '18',
                        }}
                      >
                        {cat.emoji}
                      </span>
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check size={16} className="text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-lg border-t border-border">
        <div className="max-w-md mx-auto px-4 py-3">
          <Button
            fullWidth
            size="lg"
            disabled={!selectedQuestion}
            onClick={handleNext}
          >
            다음
          </Button>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>
    </div>
  );
}
