// Adaptive tempo (PRD §20.5): keep the player at 80–85 % clean over the last 8 attempts.
export const WINDOW = 8;
export const STEP_BPM = 4;
export const RAISE_ABOVE = 0.85;
export const LOWER_BELOW = 0.8;
export const SIMPLIFY_BELOW = 0.7;
export const MIN_BELOW_START = 10;
export const MAX_ABOVE_TARGET = 20;

export type Attempt = { bpm: number; clean: boolean };

export type TempoDecision = {
  bpm: number;
  change: 'up' | 'hold' | 'down';
  cleanRate: number;
  // Still struggling at the slowest tempo: switch to the lesson's easier part.
  simplify: boolean;
};

export type TempoRange = { min: number; max: number; start?: number };

export function tempoRange(startBpm: number, targetBpm: number): TempoRange {
  return { min: startBpm - MIN_BELOW_START, max: targetBpm + MAX_ABOVE_TARGET, start: startBpm };
}

function clamp(bpm: number, { min, max }: TempoRange): number {
  return Math.min(max, Math.max(min, bpm));
}

export function nextTempo(history: Attempt[], range: TempoRange): TempoDecision {
  const last = history.at(-1);
  if (last === undefined) {
    return {
      bpm: clamp(range.start ?? range.min, range),
      change: 'hold',
      cleanRate: 0,
      simplify: false,
    };
  }
  const recent = history.slice(-WINDOW);
  const cleanRate = recent.filter((attempt) => attempt.clean).length / recent.length;
  const current = clamp(last.bpm, range);
  if (cleanRate > RAISE_ABOVE) {
    return { bpm: clamp(current + STEP_BPM, range), change: 'up', cleanRate, simplify: false };
  }
  if (cleanRate >= LOWER_BELOW) return { bpm: current, change: 'hold', cleanRate, simplify: false };
  const simplify = cleanRate < SIMPLIFY_BELOW && current <= range.min;
  return { bpm: clamp(current - STEP_BPM, range), change: 'down', cleanRate, simplify };
}

export function targetReached(bpm: number, targetBpm: number): boolean {
  return bpm >= targetBpm;
}
