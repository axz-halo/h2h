'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AppBar } from '@/components/layout/app-bar';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useChallengeStore } from '@/stores/challenge-store';
import { LETTER_MIN_LENGTH, LETTER_MAX_LENGTH, ROUTES } from '@/lib/constants';

const LETTER_RECEIVER_ID = 'user-3';
const LETTER_RECEIVER_NAME = '민서';

const getDraftKey = (id: string) => `h2h_letter_draft_${id}`;

export default function LetterWritingPage() {
  const router = useRouter();
  const params = useParams();
  const challengeId = params.id as string;
  const setLetterAfterNomineeDraft = useChallengeStore((s) => s.setLetterAfterNomineeDraft);
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const draftChecked = useRef(false);

  const isValid = content.length >= LETTER_MIN_LENGTH;

  useEffect(() => {
    if (draftChecked.current || typeof window === 'undefined') return;
    draftChecked.current = true;
    try {
      const raw = localStorage.getItem(getDraftKey(challengeId));
      if (raw) {
        const saved = raw.slice(0, LETTER_MAX_LENGTH);
        if (saved.length > 0) setShowDraftModal(true);
      }
    } catch (_) {}
  }, [challengeId]);

  useEffect(() => {
    if (!content) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(getDraftKey(challengeId), content);
      } catch (_) {}
    }, 500);
    return () => clearTimeout(t);
  }, [challengeId, content]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= LETTER_MAX_LENGTH) {
      setContent(e.target.value);
    }
  }, []);

  const handleLoadDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(getDraftKey(challengeId));
      if (raw) setContent(raw.slice(0, LETTER_MAX_LENGTH));
      localStorage.removeItem(getDraftKey(challengeId));
    } catch (_) {}
    setShowDraftModal(false);
  }, [challengeId]);

  const handleDiscardDraft = useCallback(() => {
    try {
      localStorage.removeItem(getDraftKey(challengeId));
    } catch (_) {}
    setShowDraftModal(false);
  }, [challengeId]);

  const handleNext = useCallback(() => {
    if (!isValid || isSending) return;
    try {
      localStorage.removeItem(getDraftKey(challengeId));
    } catch (_) {}
    setLetterAfterNomineeDraft({
      challengeId,
      receiverId: LETTER_RECEIVER_ID,
      receiverName: LETTER_RECEIVER_NAME,
      content,
    });
    router.push(ROUTES.CHALLENGE_NOMINATE(challengeId));
  }, [isValid, isSending, challengeId, content, setLetterAfterNomineeDraft, router]);

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <AppBar showBack title="편지 쓰기" />

      <Modal open={showDraftModal} onClose={handleDiscardDraft} title="이어서 작성할까요?">
        <p className="text-sm text-text-secondary mb-6">
          작성 중인 편지가 있어요. 이어서 작성할까요?
        </p>
        <div className="flex gap-2.5">
          <Button variant="secondary" fullWidth onClick={handleDiscardDraft}>
            새로 쓰기
          </Button>
          <Button fullWidth onClick={handleLoadDraft}>
            이어서 작성
          </Button>
        </div>
      </Modal>

      <motion.div
        className="flex-1 flex flex-col px-5 pt-4 pb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p className="text-base text-text-secondary mb-5 leading-relaxed">
          <span className="font-semibold text-text">{LETTER_RECEIVER_NAME}</span>님에게
          <br />
          진심을 담아 편지를 보내보세요.
        </p>

        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={handleChange}
            placeholder="이 사람이 좋은 이유, 전하고 싶은 말을 자유롭게 적어주세요."
            className="w-full h-full min-h-[320px] p-5 rounded-2xl bg-white border border-border-strong
              text-text text-[15px] leading-relaxed resize-none
              placeholder:text-text-muted
              focus:border-primary/40 focus:ring-2 focus:ring-primary/10
              transition-all duration-200"
            style={{
              backgroundImage:
                'repeating-linear-gradient(transparent, transparent 31px, #F1F5F9 31px, #F1F5F9 32px)',
              backgroundPosition: '0 20px',
            }}
          />
          <span
            className={`absolute bottom-4 right-4 text-xs tabular-nums ${
              content.length >= LETTER_MAX_LENGTH
                ? 'text-error'
                : content.length >= LETTER_MIN_LENGTH
                  ? 'text-text-secondary'
                  : 'text-text-muted'
            }`}
          >
            {content.length} / {LETTER_MAX_LENGTH}
          </span>
        </div>

        <div className="pt-5">
          <Button
            fullWidth
            size="lg"
            disabled={!isValid}
            loading={isSending}
            onClick={handleNext}
          >
            다음
          </Button>
          {!isValid && content.length > 0 && (
            <p className="text-xs text-text-muted text-center mt-2">
              최소 {LETTER_MIN_LENGTH}자 이상 작성해주세요
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
