'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useCountdown } from '@/hooks/use-countdown';
import { cn, truncateText } from '@/lib/utils';
import { ROUTES, MAX_CHALLENGE_PARTICIPANTS } from '@/lib/constants';
import type { ChallengeWithMyStatus } from '@/types';
import { CATEGORY_MAP } from '@/types';

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
  const category = challenge.question?.category;
  const categoryColor = category ? CATEGORY_MAP[category]?.color : undefined;
  const maxParticipants = challenge.max_participants ?? MAX_CHALLENGE_PARTICIPANTS;
  const participantCountText = `${challenge.participant_count} / ${maxParticipants}명 참여 중`;
  const statusLabel = status.label(challenge.my_participant_order);
  const isHost = challenge.my_role === 'host';
  const canTap = challenge.my_status === 'my_turn' && !isFull;

  const handleTap = () => {
    if (canTap) router.push(ROUTES.CHALLENGE_NOMINATE(challenge.id));
  };

  return (
    <motion.div whileTap={canTap ? { scale: 0.98 } : undefined}>
      <Card
        interactive={canTap}
        className={cn(
          'relative overflow-hidden p-3 min-h-[120px] flex flex-col',
          canTap && 'border border-primary/20'
        )}
        onClick={handleTap}
      >
        {/* 카테고리 색 띠 */}
        {categoryColor && (
          <div
            className="absolute top-0 left-0 right-0 h-1 shrink-0"
            style={{ backgroundColor: categoryColor }}
            aria-hidden
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 pt-1">
          <p className="text-[13px] font-semibold text-text leading-snug line-clamp-2 break-keep">
            {truncateText(questionText, 22)}
          </p>

          <div
            className={cn(
              'inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md w-fit text-xs font-semibold tabular-nums',
              isEnded ? 'bg-border text-text-muted' : 'bg-primary/10 text-primary'
            )}
          >
            <span aria-hidden>{isEnded ? '⏰' : '⏱️'}</span>
            <span>{isFull ? '종료' : isExpired ? '종료' : timeLeft}</span>
          </div>

          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-text-muted">
            <Users size={10} strokeWidth={2} />
            <span>{participantCountText}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1 mt-2">
            {isHost && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                내가 만든 챌린지
              </span>
            )}
            <span
              className={cn(
                'text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap',
                status.className
              )}
            >
              {statusLabel}
            </span>
            {canTap && (
              <ChevronRight size={14} className="text-primary ml-auto shrink-0" />
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
