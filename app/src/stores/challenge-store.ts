import { create } from 'zustand';
import type { Challenge, Question, Friend } from '@/types';

export interface LetterAfterNomineeDraft {
  challengeId: string;
  receiverId: string;
  receiverName: string;
  content: string;
}

interface ChallengeState {
  activeChallenges: Challenge[];
  pendingNominations: Challenge[];
  selectedQuestion: Question | null;
  selectedFriend: Friend | null;
  /** Host 패스 시 선택한 1명 (질문을 넘길 대상) */
  selectedPassTarget: Friend | null;
  /** Set when navigating from letter page to select next nominee (D); receiver A is excluded from list */
  letterAfterNomineeDraft: LetterAfterNomineeDraft | null;
  setActiveChallenges: (challenges: Challenge[]) => void;
  setPendingNominations: (nominations: Challenge[]) => void;
  setSelectedQuestion: (question: Question | null) => void;
  setSelectedFriend: (friend: Friend | null) => void;
  setSelectedPassTarget: (friend: Friend | null) => void;
  setLetterAfterNomineeDraft: (draft: LetterAfterNomineeDraft | null) => void;
  reset: () => void;
}

export const useChallengeStore = create<ChallengeState>((set) => ({
  activeChallenges: [],
  pendingNominations: [],
  selectedQuestion: null,
  selectedFriend: null,
  selectedPassTarget: null,
  letterAfterNomineeDraft: null,
  setActiveChallenges: (activeChallenges) => set({ activeChallenges }),
  setPendingNominations: (pendingNominations) => set({ pendingNominations }),
  setSelectedQuestion: (selectedQuestion) => set({ selectedQuestion }),
  setSelectedFriend: (selectedFriend) => set({ selectedFriend }),
  setSelectedPassTarget: (selectedPassTarget) => set({ selectedPassTarget: selectedPassTarget }),
  setLetterAfterNomineeDraft: (letterAfterNomineeDraft) => set({ letterAfterNomineeDraft }),
  reset: () =>
    set({
      selectedQuestion: null,
      selectedFriend: null,
      selectedPassTarget: null,
      letterAfterNomineeDraft: null,
    }),
}));
