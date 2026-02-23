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
import { ROUTES, MIN_INVITEES, MAX_INVITEES, MAX_CHALLENGE_CREATE } from '@/lib/constants';
import { cn, truncateText } from '@/lib/utils';
import type { Friend } from '@/types';

export default function InvitePage() {
  const router = useRouter();
  const {
    selectedQuestion,
    selectedInvitees,
    toggleInvitee,
    reset,
  } = useChallengeStore();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [search, setSearch] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);

  const remaining = user?.challenge_create_remaining ?? MOCK_USER.challenge_create_remaining;
  const questionText = selectedQuestion?.question_text ?? '질문을 선택해주세요';
  const canSubmit = selectedInvitees.length >= MIN_INVITEES && selectedInvitees.length <= MAX_INVITEES;

  const { friends: filteredFriends } = useFriends(search);

  const appFriends = filteredFriends.filter((f) => f.is_app_user);
  const contactFriends = filteredFriends.filter((f) => !f.is_app_user);

  const handleToggle = (friend: Friend) => {
    const isSelected = selectedInvitees.some((f) => f.id === friend.id);
    if (isSelected) {
      toggleInvitee(friend);
    } else if (selectedInvitees.length < MAX_INVITEES) {
      toggleInvitee(friend);
    }
  };

  const handleInviteClick = () => {
    if (!canSubmit) return;
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!canSubmit || selectedInvitees.length === 0) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 600));
    const names = selectedInvitees.map((f) => f.nickname);
    const first = names[0];
    const rest = names.length - 1;
    const message =
      rest > 0 ? `${first}님 외 ${rest}명을 초대했어요!` : `${first}님을 초대했어요!`;
    reset();
    setSending(false);
    setShowConfirm(false);
    router.push(ROUTES.HOME);
    setTimeout(() => addToast(message, 'success'), 300);
  };

  const inviteButtonLabel = (() => {
    if (selectedInvitees.length === 0) return `${MIN_INVITEES}~${MAX_INVITEES}명을 골라주세요`;
    if (selectedInvitees.length === 1) return `${selectedInvitees[0].nickname}님 초대하기`;
    const first = selectedInvitees[0].nickname;
    const rest = selectedInvitees.length - 1;
    return `${first}님 외 ${rest}명 초대하기`;
  })();

  const confirmNamesText = (() => {
    if (selectedInvitees.length <= 2) {
      return selectedInvitees.map((f) => f.nickname).join(', ');
    }
    const [a, b, ...rest] = selectedInvitees;
    return `${a.nickname}, ${b.nickname} 외 ${rest.length}명`;
  })();

  if (!selectedQuestion) {
    router.replace(ROUTES.CHALLENGE_NEW);
    return null;
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <AppBar showBack title={truncateText(questionText, 18)} />

      <p className="px-4 pt-3 pb-2 text-sm text-text-muted">
        이 질문에 답할 친구 <span className="font-semibold text-primary">{MIN_INVITEES}~{MAX_INVITEES}명</span>을 골라주세요.
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

      {selectedInvitees.length > 0 && (
        <p className="px-4 pb-2 text-xs text-text-muted">
          {selectedInvitees.length}명 선택됨 {selectedInvitees.length < MIN_INVITEES && `(최소 ${MIN_INVITEES}명)`}
          {selectedInvitees.length > MAX_INVITEES && `(최대 ${MAX_INVITEES}명)`}
        </p>
      )}

      <main className="flex-1 px-4 pb-28 overflow-y-auto">
        {appFriends.length > 0 && (
          <InviteFriendSection
            title="Heart to Hearts 친구"
            friends={appFriends}
            selectedIds={selectedInvitees.map((f) => f.id)}
            onToggle={handleToggle}
            maxReached={selectedInvitees.length >= MAX_INVITEES}
          />
        )}
        {contactFriends.length > 0 && (
          <InviteFriendSection
            title="주소록 친구"
            friends={contactFriends}
            selectedIds={selectedInvitees.map((f) => f.id)}
            onToggle={handleToggle}
            maxReached={selectedInvitees.length >= MAX_INVITEES}
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
            onClick={handleInviteClick}
          >
            {inviteButtonLabel}
          </Button>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>

      <Modal
        open={showConfirm}
        onClose={() => !sending && setShowConfirm(false)}
        title="챌린지 시작할까요?"
      >
        <p className="text-sm text-text-secondary leading-relaxed mb-6">
          이 질문으로 <span className="font-bold text-text">{confirmNamesText}</span>님을 초대할까요?
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

function InviteFriendSection({
  title,
  friends,
  selectedIds,
  onToggle,
  maxReached,
}: {
  title: string;
  friends: Friend[];
  selectedIds: string[];
  onToggle: (f: Friend) => void;
  maxReached: boolean;
}) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
        {title}
      </p>
      <div className="flex flex-col gap-1">
        <AnimatePresence>
          {friends.map((friend) => {
            const isSelected = selectedIds.includes(friend.id);
            const disabled = !isSelected && maxReached;
            return (
              <motion.button
                key={friend.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                onClick={() => !disabled && onToggle(friend)}
                disabled={disabled}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-3 rounded-[14px] transition-colors text-left',
                  disabled && !isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
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
