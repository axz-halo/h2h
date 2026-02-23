import { create } from 'zustand';
import { MAX_INVITEES } from '@/lib/constants';
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
  /** Host 초대 시 선택한 친구들 (3~5명) */
  selectedInvitees: Friend[];
  /** Set when navigating from letter page to select next nominee (D); receiver A is excluded from list */
  letterAfterNomineeDraft: LetterAfterNomineeDraft | null;
  setActiveChallenges: (challenges: Challenge[]) => void;
  setPendingNominations: (nominations: Challenge[]) => void;
  setSelectedQuestion: (question: Question | null) => void;
  setSelectedFriend: (friend: Friend | null) => void;
  setSelectedInvitees: (friends: Friend[]) => void;
  toggleInvitee: (friend: Friend) => void;
  setLetterAfterNomineeDraft: (draft: LetterAfterNomineeDraft | null) => void;
  reset: () => void;
}

export const useChallengeStore = create<ChallengeState>((set) => ({
  activeChallenges: [],
  pendingNominations: [],
  selectedQuestion: null,
  selectedFriend: null,
  selectedInvitees: [],
  letterAfterNomineeDraft: null,
  setActiveChallenges: (activeChallenges) => set({ activeChallenges }),
  setPendingNominations: (pendingNominations) => set({ pendingNominations }),
  setSelectedQuestion: (selectedQuestion) => set({ selectedQuestion }),
  setSelectedFriend: (selectedFriend) => set({ selectedFriend }),
  setSelectedInvitees: (selectedInvitees) => set({ selectedInvitees }),
  toggleInvitee: (friend) =>
    set((state) => {
      const has = state.selectedInvitees.some((f) => f.id === friend.id);
      let next =
        has
          ? state.selectedInvitees.filter((f) => f.id !== friend.id)
          : [...state.selectedInvitees, friend];
      if (next.length > MAX_INVITEES) next = next.slice(0, MAX_INVITEES);
      return { selectedInvitees: next };
    }),
  setLetterAfterNomineeDraft: (letterAfterNomineeDraft) => set({ letterAfterNomineeDraft }),
  reset: () =>
    set({
      selectedQuestion: null,
      selectedFriend: null,
      selectedInvitees: [],
      letterAfterNomineeDraft: null,
    }),
}));
