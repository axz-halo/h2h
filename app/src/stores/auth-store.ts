import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  hasCompletedProfile: boolean;
  /** Set when user lands via deep link (e.g. ?challenge_id=xxx); after profile completion redirect to CH-02 */
  pendingChallengeId: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setOnboardingComplete: () => void;
  setProfileComplete: () => void;
  setPendingChallengeId: (id: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  hasCompletedProfile: false,
  pendingChallengeId: null,
  setUser: (user) => {
    if (typeof window !== 'undefined' && user) {
      try {
        localStorage.setItem('h2h_user', JSON.stringify(user));
      } catch (_) {}
    }
    set({
      user,
      isAuthenticated: !!user,
      hasCompletedProfile: !!user?.nickname,
    });
  },
  setLoading: (isLoading) => set({ isLoading }),
  setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
  setProfileComplete: () => set({ hasCompletedProfile: true }),
  setPendingChallengeId: (pendingChallengeId) => set({ pendingChallengeId }),
  logout: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('h2h_user');
      } catch (_) {}
    }
    set({
      user: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      hasCompletedProfile: false,
      pendingChallengeId: null,
    });
  },
}));
