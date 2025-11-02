import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TestState {
  scores: {
    memory: number;
    fluency: number;
    clock: number;
    reactionTime: number;
    digitSpan: number;
  };
  demographics: {
    age?: number;
    education?: string;
  };
  memoryWords: string[];
  updateScore: (test: keyof TestState['scores'], value: number) => void;
  updateDemographics: (data: { age?: number; education?: string }) => void;
  setMemoryWords: (words: string[]) => void;
  resetTest: () => void;
}

export const useTestState = create<TestState>()(
  persist(
    (set) => ({
      scores: {
        memory: 0,
        fluency: 0,
        clock: 0,
        reactionTime: 0,
        digitSpan: 0,
      },
      demographics: {},
      memoryWords: [],
      updateScore: (test, value) =>
        set((state) => ({
          scores: { ...state.scores, [test]: value },
        })),
      updateDemographics: (data) =>
        set((state) => ({
          demographics: { ...state.demographics, ...data },
        })),
      setMemoryWords: (words) => set({ memoryWords: words }),
      resetTest: () =>
        set({
          scores: {
            memory: 0,
            fluency: 0,
            clock: 0,
            reactionTime: 0,
            digitSpan: 0,
          },
          demographics: {},
          memoryWords: [],
        }),
    }),
    {
      name: 'test-state',
    }
  )
);
