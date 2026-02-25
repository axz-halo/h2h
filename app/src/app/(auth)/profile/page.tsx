'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth-store';
import { MOCK_USER } from '@/lib/mock-data';
import { NICKNAME_MIN_LENGTH, NICKNAME_MAX_LENGTH, ROUTES } from '@/lib/constants';

const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]+$/;

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user: currentUser, setUser, setProfileComplete, pendingChallengeId, setPendingChallengeId } = useAuthStore();

  const [nickname, setNickname] = useState('');
  const [school, setSchool] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nicknameError = useMemo(() => {
    if (!nickname) return undefined;
    if (nickname.length < NICKNAME_MIN_LENGTH) return `${NICKNAME_MIN_LENGTH}자 이상 입력해주세요`;
    if (nickname.length > NICKNAME_MAX_LENGTH) return `${NICKNAME_MAX_LENGTH}자 이하로 입력해주세요`;
    if (!NICKNAME_REGEX.test(nickname)) return '한글, 영문, 숫자만 사용할 수 있어요';
    return undefined;
  }, [nickname]);

  const isValid = nickname.length >= NICKNAME_MIN_LENGTH
    && nickname.length <= NICKNAME_MAX_LENGTH
    && NICKNAME_REGEX.test(nickname);

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nickname, school: school || '' }),
      });
      if (res.ok) {
        const profile = await res.json();
        setUser(profile);
      } else {
        const base = currentUser ?? MOCK_USER;
        setUser({ ...base, nickname, school: school || null });
      }
    } catch {
      const base = currentUser ?? MOCK_USER;
      setUser({ ...base, nickname, school: school || null });
    }

    setProfileComplete();
    if (pendingChallengeId) {
      setPendingChallengeId(null);
      router.replace(ROUTES.CHALLENGE_NOMINATE(pendingChallengeId));
    } else {
      router.replace(ROUTES.HOME);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh px-6 pt-16 pb-8 bg-gradient-to-b from-rose-50/40 to-bg">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-text mb-2">
          프로필을 설정해주세요
        </h1>
        <p className="text-sm text-text-muted mb-8">
          친구들이 나를 더 잘 찾을 수 있게요 👋
        </p>

        {/* Avatar placeholder */}
        <div className="flex justify-center mb-10">
          <motion.button
            type="button"
            className="relative w-24 h-24 rounded-full bg-surface border-2 border-dashed border-primary/30 flex items-center justify-center active:scale-95 transition-transform shadow-sm ring-4 ring-primary/5"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Camera className="w-7 h-7 text-text-muted" strokeWidth={1.5} />
            <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-md text-white text-xs font-bold">
              +
            </span>
          </motion.button>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-5">
          <Input
            label="닉네임"
            placeholder="2~8자 (한글, 영문, 숫자)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, NICKNAME_MAX_LENGTH + 1))}
            error={nicknameError}
            maxLength={NICKNAME_MAX_LENGTH + 1}
          />

          <Input
            label="학교 (선택)"
            placeholder="학교 이름을 입력해주세요"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            hint="학교를 입력하면 같은 학교 친구를 더 쉽게 찾을 수 있어요!"
          />
        </div>
      </motion.div>

      <div className="flex-1" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Button
          fullWidth
          size="lg"
          disabled={!isValid}
          loading={isSubmitting}
          onClick={handleSubmit}
        >
          완료 ✨
        </Button>
      </motion.div>
    </div>
  );
}
