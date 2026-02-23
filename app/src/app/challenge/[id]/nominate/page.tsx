'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check } from 'lucide-react';
import { AppBar } from '@/components/layout/app-bar';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useChallengeStore } from '@/stores/challenge-store';
import { useToastStore } from '@/stores/toast-store';
import { useFriends } from '@/hooks/use-friends';
import { MOCK_CHALLENGES, MOCK_CHALLENGE_PARTICIPANT_IDS } from '@/lib/mock-data';
import { ROUTES, MAX_CHALLENGE_PARTICIPANTS, CHALLENGE_FULL_MESSAGE } from '@/lib/constants';
import { cn, truncateText } from '@/lib/utils';
import type { Friend } from '@/types';

const MUTUAL_TRIGGER_ID = 'user-3';

export default function NominatePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const challengeId = params.id as string;
  const challenge = MOCK_CHALLENGES.find((c) => c.id === challengeId);
  const isFull = challenge && challenge.participant_count >= MAX_CHALLENGE_PARTICIPANTS;
  const isInvitee = searchParams.get('from') === 'invite';

  useEffect(() => {
    if (challengeId === 'new') {
      router.replace(ROUTES.CHALLENGE_INVITE);
    }
  }, [challengeId, router]);

  const {
    selectedQuestion,
    selectedFriend,
    setSelectedFriend,
    reset,
    letterAfterNomineeDraft,
    setLetterAfterNomineeDraft,
  } = useChallengeStore();
  const { addToast } = useToastStore();

  const [search, setSearch] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);

  const { friends: friendsFromApi } = useFriends(search);
  const isAfterLetterMode = letterAfterNomineeDraft?.challengeId === challengeId;
  const excludeReceiverId = isAfterLetterMode ? letterAfterNomineeDraft?.receiverId : null;
  const participantIds = MOCK_CHALLENGE_PARTICIPANT_IDS[challengeId] ?? [];

  const questionText = isAfterLetterMode
    ? '체인을 이어갈 친구를 선택해주세요'
    : selectedQuestion?.question_text ?? '친구를 지목해주세요';

  const filteredFriends = useMemo(() => {
    if (excludeReceiverId) return friendsFromApi.filter((f) => f.id !== excludeReceiverId);
    return friendsFromApi;
  }, [friendsFromApi, excludeReceiverId]);

  const appFriends = filteredFriends.filter((f) => f.is_app_user);
  const contactFriends = filteredFriends.filter((f) => !f.is_app_user);

  const handleSelect = (friend: Friend) => {
    if (isFull || participantIds.includes(friend.id)) return;
    setSelectedFriend(selectedFriend?.id === friend.id ? null : friend);
  };

  const handleSendClick = () => {
    if (!selectedFriend) return;
    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    if (!selectedFriend) return;
    setSending(true);

    await new Promise((r) => setTimeout(r, 800));

    if (isAfterLetterMode) {
      setLetterAfterNomineeDraft(null);
      reset();
      setSending(false);
      setShowConfirm(false);
      router.push(ROUTES.HOME);
      setTimeout(() => {
        addToast('편지를 보냈고, 다음 주자에게 차례를 넘겼어요!', 'success');
      }, 300);
      return;
    }

    const isMutual = selectedFriend.id === MUTUAL_TRIGGER_ID;

    reset();
    setSending(false);
    setShowConfirm(false);

    if (isMutual) {
      router.push(ROUTES.CHALLENGE_MUTUAL(challengeId));
    } else {
      router.push(ROUTES.HOME);
      setTimeout(() => {
        addToast(`${selectedFriend.nickname}님 차례로 넘겼어요!`, 'success');
      }, 300);
    }
  };

  if (challengeId === 'new') return null;

  return (
    <div className="flex flex-col min-h-dvh">
      <AppBar showBack title={truncateText(questionText, 16)} />

      {isInvitee && !isAfterLetterMode && (
        <p className="px-4 pt-3 pb-1 text-sm font-semibold text-primary">
          누군가 이 질문을 던졌어요!
        </p>
      )}

      {isFull && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-primary/10 text-primary text-sm font-medium">
          {CHALLENGE_FULL_MESSAGE}
        </div>
      )}

      <div className="px-4 pt-2 pb-3">
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

      {!isAfterLetterMode && (
        <p className="px-4 pb-2 text-sm text-text-muted">
          이 질문에 답할 다음 사람을 골라주세요.
        </p>
      )}

      <main className="flex-1 px-4 pb-28 overflow-y-auto">
        {appFriends.length > 0 && (
          <FriendSection
            title="Heart to Hearts 친구"
            friends={appFriends}
            selected={selectedFriend}
            onSelect={handleSelect}
            participantIds={participantIds}
          />
        )}

        {contactFriends.length > 0 && (
          <FriendSection
            title="주소록 친구"
            friends={contactFriends}
            selected={selectedFriend}
            onSelect={handleSelect}
            participantIds={participantIds}
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
            disabled={!selectedFriend || isFull}
            onClick={handleSendClick}
          >
            {isFull
              ? '참여 인원이 가득 찼어요'
              : selectedFriend
                ? `${selectedFriend.nickname}님 차례로 넘기기`
                : '친구를 선택해주세요'}
          </Button>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>

      <Modal
        open={showConfirm}
        onClose={() => !sending && setShowConfirm(false)}
        title={isAfterLetterMode ? '편지 전송 및 다음 차례' : '차례 넘기기'}
      >
        <p className="text-sm text-text-secondary leading-relaxed mb-6">
          {isAfterLetterMode ? (
            <>
              편지를 전달하고 <span className="font-bold text-text">{selectedFriend?.nickname}</span>님에게
              챌린지를 이어가시겠어요?
              <br />
              넘긴 후에는 취소할 수 없어요.
            </>
          ) : (
            <>
              이 질문에 답할 다음 사람을 <span className="font-bold text-text">{selectedFriend?.nickname}</span>님으로 할까요?
              <br />
              넘긴 후에는 취소할 수 없어요.
            </>
          )}
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
          <Button
            fullWidth
            loading={sending}
            onClick={handleConfirmSend}
          >
            넘기기
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function FriendSection({
  title,
  friends,
  selected,
  onSelect,
  participantIds,
}: {
  title: string;
  friends: Friend[];
  selected: Friend | null;
  onSelect: (f: Friend) => void;
  participantIds: string[];
}) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
        {title}
      </p>
      <div className="flex flex-col gap-1">
        <AnimatePresence>
          {friends.map((friend) => {
            const isSelected = selected?.id === friend.id;
            const isParticipant = participantIds.includes(friend.id);
            return (
              <motion.button
                key={friend.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelect(friend)}
                disabled={isParticipant}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-3 rounded-[14px] transition-colors text-left',
                  isParticipant ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
                  isSelected
                    ? 'bg-surface border border-primary/20'
                    : !isParticipant && 'hover:bg-surface/60'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                    isParticipant ? 'bg-border text-text-muted' : isSelected
                      ? 'bg-primary text-white'
                      : 'bg-surface text-primary'
                  )}
                >
                  {friend.nickname[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-text truncate">
                    {friend.nickname}
                  </p>
                  {!friend.is_app_user && friend.phone_last4 && (
                    <p className="text-xs text-text-muted mt-0.5">
                      ****-{friend.phone_last4}
                    </p>
                  )}
                </div>

                {isParticipant && (
                  <span className="text-xs font-medium text-text-muted bg-surface px-2 py-1 rounded-full shrink-0">
                    이미 참여 중
                  </span>
                )}
                {isSelected && !isParticipant && (
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
