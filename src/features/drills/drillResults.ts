import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MinuteResult = { from: string; to: string; changes: number; at: number };

const MAX_RESULTS = 50;

type DrillResultsStore = {
  minutes: MinuteResult[];
  addMinute: (result: MinuteResult) => void;
};

// One-minute-changes results, kept on this device (progress sync arrives later).
export const useDrillResults = create<DrillResultsStore>()(
  persist(
    (set) => ({
      minutes: [],
      addMinute: (result) => {
        set((state) => ({ minutes: [result, ...state.minutes].slice(0, MAX_RESULTS) }));
      },
    }),
    { name: 'a6.drills' },
  ),
);

export function bestMinute(minutes: MinuteResult[], from: string, to: string): number | null {
  const matching = minutes.filter((result) => result.from === from && result.to === to);
  return matching.length === 0 ? null : Math.max(...matching.map((result) => result.changes));
}
