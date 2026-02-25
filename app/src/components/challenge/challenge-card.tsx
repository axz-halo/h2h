'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, Users, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useCountdown } from '@/hooks/use-countdown';
import { cn, truncateText } from '@/lib/utils';
import { ROUTES, MAX_CHALLENGE_PARTICIPANTS } from '@/lib/constants';
import type { ChallengeWithMyStatus } from '@/types';

type MyStatus = 'my_turn' | 'completed' | 'waiting';

interface ChallengeCardProps {
  challenge: ChallengeWithMyStatus;
}

const STATUS_CONFIG: Record<MyStatus, { label: (order?: number) => string; className: string }> = {
  my_turn: {
    label: () => '내 차례!',
    className: 'bg-primary/10 text-primary font-bold',
  },
  completed: {
    label: (order) => (order != null ? `${order}번째로 참여 완료` : '참여 완료'),
    className: 'bg-border text-text-muted font-medium',
  },
  waiting: {
    label: () => '대기 중',
    className: 'bg-warning/10 text-warning font-medium',
  },
};

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const router = useRouter();
  const { timeLeft, isExpired } = useCountdown(challenge.expires_at);
  const isFull = challenge.participant_count >= MAX_CHALLENGE_PARTICIPANTS;
  const isEnded = isExpired || isFull;
  const status = STATUS_CONFIG[challenge.my_status];
  const questionText = challenge.question?.question_text ?? '';
  const maxParticipants = challenge.max_participants ?? MAX_CHALLENGE_PARTICIPANTS;
  const participantLabel = challenge.participant_display
    ? `${challenge.participant_display} 참여`
    : `${challenge.participant_count}명 참여`;
  const participantCountText = `${challenge.participant_count} / ${maxParticipants}명 참여 중`;
  const statusLabel = status.label(challenge.my_participant_order);
  const isHost = challenge.my_role === 'host';
  const canTap = challenge.my_status === 'my_turn' && !isFull;

  const handleTap = () => {
    if (canTap) router.push(ROUTES.CHALLENGE_NOMINATE(challenge.id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileTap={canTap ? { scale: 0.98 } : undefined}
    >
      <Card
        interactive={canTap}
        className={cn(
          'p-4',
          canTap && 'border border-primary/20'
        )}
        onClick={handleTap}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-text leading-snug truncate">
              {truncateText(questionText, 28)}
            </p>

            {/* 남은 시간 강조 (30명 도달 시 즉시 종료) */}
            <div
              className={cn(
                'inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-1 rounded-lg',
                isEnded ? 'bg-border text-text-muted' : 'bg-primary/10 text-primary'
              )}
            >
              <span className="text-base" aria-hidden>
                {isEnded ? '⏰' : '⏱️'}
              </span>
              <span className={cn(
                'font-semibold tabular-nums',
                isEnded ? 'text-sm' : 'text-[15px]'
              )}>
                {isFull ? '30명 참여 · 종료됨' : isExpired ? '종료됨' : timeLeft}
              </span>
            </div>

            <div className="flex items-center gap-1 mt-2 text-xs text-text-muted">
              <Users size={12} strokeWidth={2} />
              <span>{participantCountText}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {isHost && (
              <span className="text-xs px-2.5 py-1 rounded-full whitespace-nowrap bg-primary/10 text-primary font-medium">
                내가 만든 챌린지
              </span>
            )}
            <span
              className={cn(
                'text-xs px-2.5 py-1 rounded-full whitespace-nowrap',
                status.className
              )}
            >
              {statusLabel}
            </span>
            {canTap && (
              <span className="inline-flex items-center gap-0.5">
                <span className="text-sm" aria-hidden>✨</span>
                <ChevronRight size={16} className="text-primary" />
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
