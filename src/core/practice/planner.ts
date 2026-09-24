import { localDay, splitKey } from '../progress/record.ts';
import type { ProgressData, TransitionRecord } from '../progress/schema.ts';
import { warmupFor, type Warmup } from './warmup.ts';

export const REVIEWS = 3;
const DAY_MS = 86_400_000;

export type PlannerLesson = { id: string; targetBpm: number; module?: string };

// Play time: the ready tune, else the newest unlocked riff, else a jam over the groove.
export type PlayItem = { kind: 'tune' | 'riff' | 'jam'; id: string | null };

export type SessionMinutes = { warmup: number; lesson: number; reviews: number; play: number };

export type SessionPlan = {
  warmup: Warmup;
  newLesson: string | null;
  reviews: string[];
  // A module tune, once three quarters of its module's lessons are done.
  tune: string | null;
  play: PlayItem;
  minutes: SessionMinutes;
};

export type PlannerRiff = { id: string; unlockedBy: string | null };

export type PlannerExtras = { tunes?: PlannerLesson[]; riffs?: PlannerRiff[] };

export const TUNE_READY_SHARE = 0.75;
export const SESSION_MINUTES = 20;
// At least this share of every session is music: a tune, a riff or a jam (PRD §20.4).
export const PLAY_SHARE = 0.3;
const WARMUP_MINUTES = 3;
const REVIEW_MINUTES = 5;

export function sessionMinutes(hasReviews: boolean): SessionMinutes {
  const play = Math.ceil(SESSION_MINUTES * PLAY_SHARE);
  const reviews = hasReviews ? REVIEW_MINUTES : 0;
  return {
    warmup: WARMUP_MINUTES,
    reviews,
    play,
    lesson: SESSION_MINUTES - WARMUP_MINUTES - reviews - play,
  };
}

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

function done(progress: ProgressData, lesson: PlannerLesson): boolean {
  return (progress.lessons[lesson.id]?.bestBpm ?? 0) >= lesson.targetBpm;
}

// Warm-up, the first unfinished lesson in course order, up to three due changes (highest
// miss rate first; ties by key so the plan is the same all day) and, when ready, a tune.
export function planSession(
  today: string,
  progress: ProgressData,
  lessons: PlannerLesson[],
  { tunes = [], riffs = [] }: PlannerExtras = {},
): SessionPlan {
  const newLesson = lessons.find((lesson) => !done(progress, lesson))?.id ?? null;
  const tune =
    tunes.find((candidate) => {
      const inModule = lessons.filter((lesson) => lesson.module === candidate.module);
      const finished = inModule.filter((lesson) => done(progress, lesson)).length;
      return (
        inModule.length > 0 &&
        finished / inModule.length >= TUNE_READY_SHARE &&
        !done(progress, candidate)
      );
    })?.id ?? null;
  const reviews = Object.values(progress.transitions)
    .filter((record) => {
      const { from, to } = splitKey(record.transitionKey);
      return from !== '' && to !== '' && isDue(record, today);
    })
    .sort((a, b) => missRate(b) - missRate(a) || a.transitionKey.localeCompare(b.transitionKey))
    .slice(0, REVIEWS)
    .map((record) => record.transitionKey);
  const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const riff = riffs
    .filter((candidate) => {
      const gate = candidate.unlockedBy === null ? undefined : byId.get(candidate.unlockedBy);
      return gate === undefined || done(progress, gate);
    })
    .at(-1);
  const play: PlayItem =
    tune !== null
      ? { kind: 'tune', id: tune }
      : riff !== undefined
        ? { kind: 'riff', id: riff.id }
        : { kind: 'jam', id: null };
  return {
    warmup: warmupFor(today),
    newLesson,
    reviews,
    tune,
    play,
    minutes: sessionMinutes(reviews.length > 0),
  };
}
