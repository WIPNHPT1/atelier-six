import type { Shape } from '../shapes/types.ts';

export type RemainingSchedule = { shapes: Shape[]; bars: number[] };

export function remainingFromBar(
  shapes: Shape[],
  bars: number[],
  resumeBar: number,
): RemainingSchedule {
  let cursor = 0;
  for (const index of shapes.keys()) {
    const barCount = bars[index] ?? 0;
    if (cursor + barCount > resumeBar) {
      const barsIntoChord = Math.max(0, resumeBar - cursor);
      return {
        shapes: shapes.slice(index),
        bars: [barCount - barsIntoChord, ...bars.slice(index + 1)],
      };
    }
    cursor += barCount;
  }
  return { shapes: [], bars: [] };
}
