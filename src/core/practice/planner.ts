import { localDay, splitKey } from '../progress/record.ts';
import type { ProgressData, TransitionRecord } from '../progress/schema.ts';
import { warmupFor, type Warmup } from './warmup.ts';

export const REVIEWS = 3;
const DAY_MS = 86_400_000;

export type PlannerLesson = { id: string; targetBpm: number };

export type SessionPlan = {
  warmup: Warmup;
  newLesson: string | null;
  reviews: string[];
};

function daysBetween(from: string, to: string): number {
  const toTime = (day: string) => {
    const [y, m, d] = day.split('-').map(Number) as [number, number, number];
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toTime(to) - toTime(from)) / DAY_MS);
}

export function isDue(record: TransitionRecord, today: string): boolean {
  return daysBetween(localDay(record.lastMs), today) >= record.interval;
}

// Every stored record has at least one attempt.
function missRate(record: TransitionRecord): number {
  return record.misses / record.attempts;
}

// Warm-up, the first unfinished lesson in course order, and up to three due changes
// (highest miss rate first; ties by key so the plan is the same all day).
export function planSession(
  today: string,
  progress: ProgressData,
  lessons: PlannerLesson[],
): SessionPlan {
  const newLesson =
    lessons.find((lesson) => (progress.lessons[lesson.id]?.bestBpm ?? 0) < lesson.targetBpm)?.id ??
    null;
  const reviews = Object.values(progress.transitions)
    .filter((record) => {
      const { from, to } = splitKey(record.transitionKey);
      return from !== '' && to !== '' && isDue(record, today);
    })
    .sort((a, b) => missRate(b) - missRate(a) || a.transitionKey.localeCompare(b.transitionKey))
    .slice(0, REVIEWS)
    .map((record) => record.transitionKey);
  return { warmup: warmupFor(today), newLesson, reviews };
}
