import type { ScheduleEvent } from './buildSchedule.ts';

const SIXTEENTHS_PER_BAR = 16;
const EIGHTH_STEP = 2;
const OFFBEAT_EIGHTH_STEP_MOD = 2;
const STRAIGHT_SWING = 0.5;
const REFERENCE_VELOCITY = 0.7;
const SPREAD_SCALE_PER_VELOCITY = 0.5;
const MIN_SPREAD_SCALE = 0.5;
const MAX_SPREAD_SCALE = 1.5;
const NEIGHBOUR_GUARD_FRACTION = 0.4;

export type HumaniseOptions = {
  seed: number;
  timingMs?: number;
  velocityPct?: number;
  swing?: number;
  accents?: number;
};

const DEFAULTS = {
  timingMs: 8,
  velocityPct: 10,
  swing: STRAIGHT_SWING,
  accents: 1,
};

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isBarStart(event: ScheduleEvent): boolean {
  return event.step % SIXTEENTHS_PER_BAR === 0;
}

function isOffbeatEighth(event: ScheduleEvent): boolean {
  return (
    ((event.step % (EIGHTH_STEP * 2)) + EIGHTH_STEP * 2) % (EIGHTH_STEP * 2) ===
    OFFBEAT_EIGHTH_STEP_MOD
  );
}

function stepDurSecondsFromEvents(events: ScheduleEvent[]): number {
  for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1];
    const curr = events[i];
    if (prev === undefined || curr === undefined) continue;
    const stepDelta = curr.step - prev.step;
    const timeDelta = curr.t - prev.t;
    if (stepDelta > 0 && timeDelta > 0) return timeDelta / stepDelta;
  }
  return 0;
}

function swingDelaySeconds(swing: number, stepDur: number): number {
  const eighthDur = stepDur * EIGHTH_STEP;
  return (swing - STRAIGHT_SWING) * eighthDur;
}

function spreadScaleFor(velocity: number): number {
  const scale = 1 - (velocity - REFERENCE_VELOCITY) * SPREAD_SCALE_PER_VELOCITY;
  return clamp(scale, MIN_SPREAD_SCALE, MAX_SPREAD_SCALE);
}

/**
 * Seeded, deterministic humanisation: nudges timing and velocity, applies swing to
 * off-beat eighths, and tightens strum spread as velocity rises. Bar-start events and
 * clicks (the metronome) are left exactly on the grid. Never reorders events.
 *
 * `buildSchedule` doesn't return events in time order when a click track is present
 * (each bar's clicks are appended after that bar's content), so neighbour gaps for the
 * reorder guard are found via a separate time-sorted ranking, not array adjacency.
 */
export function humanise(events: ScheduleEvent[], options: HumaniseOptions): ScheduleEvent[] {
  const { seed, timingMs, velocityPct, swing, accents } = { ...DEFAULTS, ...options };
  const random = mulberry32(seed);
  const stepDur = stepDurSecondsFromEvents(events);
  const swingDelay = swingDelaySeconds(swing, stepDur);
  const maxJitterSeconds = timingMs / 1000;

  const timeOrder = events
    .map((_, index) => index)
    .sort((a, b) => (events[a]?.t ?? 0) - (events[b]?.t ?? 0));
  const rankOf = new Map<number, number>(timeOrder.map((origIndex, rank) => [origIndex, rank]));

  return events.map((event, index) => {
    // consume RNG in fixed order even when skipped, so later events stay reproducible
    const timingRoll = random() * 2 - 1;
    const velocityRoll = random() * 2 - 1;

    if (event.kind === 'click') return event;

    const rank = rankOf.get(index) ?? index;
    const prevIndex = timeOrder[rank - 1];
    const nextIndex = timeOrder[rank + 1];
    const prev = prevIndex === undefined ? undefined : events[prevIndex];
    const next = nextIndex === undefined ? undefined : events[nextIndex];
    const gapBefore = prev === undefined ? Infinity : event.t - prev.t;
    const gapAfter = next === undefined ? Infinity : next.t - event.t;
    const neighbourGuard = Math.min(gapBefore, gapAfter) * NEIGHBOUR_GUARD_FRACTION;
    const jitterCap = Number.isFinite(neighbourGuard)
      ? Math.min(maxJitterSeconds, neighbourGuard)
      : maxJitterSeconds;

    const barLocked = isBarStart(event);
    const timingJitter = barLocked ? 0 : timingRoll * jitterCap;
    const swingShift = barLocked || !isOffbeatEighth(event) ? 0 : swingDelay;
    const shiftCap = Number.isFinite(neighbourGuard)
      ? Math.max(jitterCap, neighbourGuard)
      : Math.abs(timingJitter) + Math.abs(swingShift);
    const shift = barLocked ? 0 : clamp(timingJitter + swingShift, -shiftCap, shiftCap);

    const accentBoost = event.accent ? accents : 1;
    const velocityJitter = 1 + velocityRoll * (velocityPct / 100) * accentBoost;
    const velocity = Math.max(0, event.velocity * velocityJitter);

    const spreadScale = spreadScaleFor(velocity);
    const strings = event.strings.map((hit) => ({ ...hit, offset: hit.offset * spreadScale }));

    return {
      ...event,
      t: event.t + shift,
      velocity,
      strings,
    };
  });
}
