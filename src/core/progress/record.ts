import type { MinuteScore, ProgressData, SessionRecord, TransitionRecord } from './schema.ts';

export function transitionKey(fromShapeId: string, toShapeId: string): string {
  return `${fromShapeId}>${toShapeId}`;
}

export function chordOfShape(shapeId: string): string {
  return shapeId.split('.')[0] as string;
}

export function splitKey(key: string): { from: string; to: string } {
  const [from = '', to = ''] = key.split('>');
  return { from, to };
}

export function localDay(time: number): string {
  const date = new Date(time);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${String(date.getFullYear())}-${month}-${day}`;
}

export type LessonAttempt = { lessonId: string; bpm: number; clean: boolean; now: number };

export function recordLessonAttempt(data: ProgressData, attempt: LessonAttempt): ProgressData {
  const previous = data.lessons[attempt.lessonId];
  const record = {
    lessonId: attempt.lessonId,
    bestBpm: attempt.clean
      ? Math.max(previous?.bestBpm ?? 0, attempt.bpm)
      : (previous?.bestBpm ?? 0),
    cleanStreak: attempt.clean ? (previous?.cleanStreak ?? 0) + 1 : 0,
    lastPracticed: attempt.now,
  };
  return { ...data, lessons: { ...data.lessons, [attempt.lessonId]: record } };
}

export type TransitionAttempt = { key: string; clean: boolean; now: number };

export const MAX_INTERVAL_DAYS = 30;

// A miss resets the review interval to 1 day; a clean session doubles it (once per day, max 30).
export function nextInterval(
  previous: TransitionRecord | undefined,
  clean: boolean,
  day: string,
): number {
  if (!clean) return 1;
  const interval = previous?.interval ?? 1;
  if (previous?.reviewedOn === day) return interval;
  return Math.min(MAX_INTERVAL_DAYS, interval * 2);
}

export function recordTransition(data: ProgressData, attempt: TransitionAttempt): ProgressData {
  const previous = data.transitions[attempt.key];
  const day = localDay(attempt.now);
  const record = {
    transitionKey: attempt.key,
    attempts: (previous?.attempts ?? 0) + 1,
    misses: (previous?.misses ?? 0) + (attempt.clean ? 0 : 1),
    lastMs: attempt.now,
    interval: nextInterval(previous, attempt.clean, day),
    reviewedOn: day,
  };
  return { ...data, transitions: { ...data.transitions, [attempt.key]: record } };
}

export function addMinuteScore(data: ProgressData, score: MinuteScore): ProgressData {
  return { ...data, minutes: [...data.minutes, score] };
}

export function addPractice(data: ProgressData, session: SessionRecord): ProgressData {
  const existing = data.sessions.find((entry) => entry.date === session.date);
  const sessions = existing
    ? data.sessions.map((entry) =>
        entry.date === session.date
          ? { ...entry, minutes: entry.minutes + session.minutes }
          : entry,
      )
    : [...data.sessions, session];
  return { ...data, sessions };
}

export function minutesOn(data: ProgressData, date: string): number {
  return data.sessions.find((entry) => entry.date === date)?.minutes ?? 0;
}

// Minutes over the seven days ending on `now`.
export function minutesThisWeek(data: ProgressData, now: number): number {
  const DAY_MS = 86_400_000;
  const days = new Set(Array.from({ length: 7 }, (_, i) => localDay(now - i * DAY_MS)));
  return data.sessions
    .filter((entry) => days.has(entry.date))
    .reduce((sum, e) => sum + e.minutes, 0);
}

export function bestMinute(data: ProgressData, key: string): number | null {
  const scores = data.minutes.filter((score) => score.key === key).map((score) => score.count);
  return scores.length === 0 ? null : Math.max(...scores);
}

export function minuteSeries(data: ProgressData): { key: string; counts: number[] }[] {
  const byKey = new Map<string, number[]>();
  for (const score of [...data.minutes].sort((a, b) => a.date - b.date)) {
    byKey.set(score.key, [...(byKey.get(score.key) ?? []), score.count]);
  }
  return [...byKey.entries()].map(([key, counts]) => ({ key, counts }));
}
