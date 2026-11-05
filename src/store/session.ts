import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { env } from '@/config/env';
import { storage } from '@/offline/storage';

export const bugLevels = ['off', 'easy', 'medium', 'hard'] as const;
export type BugLevel = (typeof bugLevels)[number];

/** `null`: follow the system appearance. */
export type ThemePreference = 'light' | 'dark' | null;

type SessionState = {
  themePreference: ThemePreference;
  setThemePreference: (themePreference: ThemePreference) => void;
  /** `X-Candidate-Id`: the API keeps one portfolio and order book per value. */
  candidateId: string;
  /** `X-Enable-Bugs`: QA knob, dev builds only. Not persisted: every launch starts clean. */
  bugLevel: BugLevel;
  setCandidateId: (candidateId: string) => void;
  setBugLevel: (bugLevel: BugLevel) => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      candidateId: env.CANDIDATE_ID,
      bugLevel: 'off',
      themePreference: null,
      setThemePreference: (themePreference) => set({ themePreference }),
      setCandidateId: (candidateId) => set({ candidateId: candidateId.trim() }),
      setBugLevel: (bugLevel) => set({ bugLevel }),
    }),
    {
      name: 'cocos.session',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        candidateId: state.candidateId,
        themePreference: state.themePreference,
      }),
    },
  ),
);
