'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check } from 'lucide-react';
import { AppBar } from '@/components/layout/app-bar';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useChallengeStore } from '@/stores/challenge-store';
import { useAuthStore } from '@/stores/auth-store';
import { useToastStore } from '@/stores/toast-store';
import { useFriends } from '@/hooks/use-friends';
import { MOCK_USER } from '@/lib/mock-data';
import { ROUTES, MAX_CHALLENGE_CREATE } from '@/lib/constants';
import { cn, truncateText } from '@/lib/utils';
import type { Friend } from '@/types';

export default function InvitePage() {
  const router = useRouter();
  const {
    selectedQuestion,
    selectedPassTarget,
    setSelectedPassTarget,
    reset,
  } = useChallengeStore();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [search, setSearch] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);

  const remaining = user?.challenge_create_remaining ?? MOCK_USER.challenge_create_remaining;
  const questionText = selectedQuestion?.question_text ?? '질문을 선택해주세요';
  const canSubmit = selectedPassTarget !== null;

  const { friends: filteredFriends } = useFriends(search);

  const appFriends = filteredFriends.filter((f) => f.is_app_user);
  const contactFriends = filteredFriends.filter((f) => !f.is_app_user);

  const handleSelect = (friend: Friend) => {
    setSelectedPassTarget(selectedPassTarget?.id === friend.id ? null : friend);
  };

  const handlePassClick = () => {
    if (!canSubmit) return;
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!canSubmit || !selectedPassTarget || !selectedQuestion) return;
    setSending(true);
    const name = selectedPassTarget.nickname;
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          question_id: selectedQuestion.id,
          first_pass_user_id: selectedPassTarget.id,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        addToast(err?.error ?? '챌린지 생성에 실패했어요', 'error');
        setSending(false);
        setShowConfirm(false);
        return;
      }
    } catch {
      addToast('네트워크 오류가 났어요', 'error');
      setSending(false);
      setShowConfirm(false);
      return;
    }
    reset();
    setSending(false);
    setShowConfirm(false);
    router.push(ROUTES.HOME);
    setTimeout(() => addToast(`${name}님에게 질문을 넘겼어요!`, 'success'), 300);
  };

  const passButtonLabel = selectedPassTarget
    ? `${selectedPassTarget.nickname}님에게 질문 넘기기`
    : '친구를 선택해주세요';

  if (!selectedQuestion) {
    router.replace(ROUTES.CHALLENGE_NEW);
    return null;
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <AppBar showBack title={truncateText(questionText, 18)} />

      <p className="px-4 pt-3 pb-1 text-sm font-semibold text-text">
        누구에게 이 질문을 넘길까요?
      </p>
      <p className="px-4 pb-3 text-sm text-text-muted">
        선택한 친구에게 이 질문이 전달됩니다. 당신의 선택은 비밀이에요.
      </p>

      <div className="px-4 pb-3">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름으로 검색"
            className={cn(
              'w-full h-11 pl-10 pr-4 rounded-[14px] bg-surface text-sm text-text',
              'placeholder:text-text-muted border border-transparent',
              'focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors'
            )}
          />
        </div>
      </div>

      <main className="flex-1 px-4 pb-28 overflow-y-auto">
        {appFriends.length > 0 && (
          <PassFriendSection
            title="Heart to Hearts 친구"
            friends={appFriends}
            selectedId={selectedPassTarget?.id ?? null}
            onSelect={handleSelect}
          />
        )}
        {contactFriends.length > 0 && (
          <PassFriendSection
            title="주소록 친구"
            friends={contactFriends}
            selectedId={selectedPassTarget?.id ?? null}
            onSelect={handleSelect}
          />
        )}
        {filteredFriends.length === 0 && (
          <div className="flex items-center justify-center py-16 text-sm text-text-muted">
            검색 결과가 없어요
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-lg border-t border-border">
        <div className="max-w-md mx-auto px-4 py-3">
          <Button
            fullWidth
            size="lg"
            disabled={!canSubmit}
            onClick={handlePassClick}
          >
            {passButtonLabel}
          </Button>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>

      <Modal
        open={showConfirm}
        onClose={() => !sending && setShowConfirm(false)}
        title="질문을 넘길까요?"
      >
        <p className="text-sm text-text-secondary leading-relaxed mb-6">
          이 질문을 <span className="font-bold text-text">{selectedPassTarget?.nickname}</span>님에게 넘길까요?
          <br />
          <span className="text-text-muted">남은 생성 횟수: {remaining}/{MAX_CHALLENGE_CREATE}</span>
        </p>
        <div className="flex gap-2.5">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowConfirm(false)}
            disabled={sending}
          >
            취소
          </Button>
          <Button fullWidth loading={sending} onClick={handleConfirm}>
            시작하기
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function PassFriendSection({
  title,
  friends,
  selectedId,
  onSelect,
}: {
  title: string;
  friends: Friend[];
  selectedId: string | null;
  onSelect: (f: Friend) => void;
}) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
        {title}
      </p>
      <div className="flex flex-col gap-1">
        <AnimatePresence>
          {friends.map((friend) => {
            const isSelected = selectedId === friend.id;
            return (
              <motion.button
                key={friend.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelect(friend)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-3 rounded-[14px] transition-colors text-left cursor-pointer',
                  isSelected ? 'bg-surface border border-primary/20' : 'hover:bg-surface/60'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                    isSelected ? 'bg-primary text-white' : 'bg-surface text-primary'
                  )}
                >
                  {friend.nickname[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-text truncate">
                    {friend.nickname}
                  </p>
                  {!friend.is_app_user && friend.phone_last4 && (
                    <p className="text-xs text-text-muted mt-0.5">****-{friend.phone_last4}</p>
                  )}
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0"
                  >
                    <Check size={14} className="text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
