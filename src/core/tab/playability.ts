import type { Finger } from '../shapes/types.ts';
import type { PitchClass } from '../theory/pitch.ts';
import type { Tuning } from '../tuning.ts';

const STRING_COUNT = 6;
export const MAX_SHIFT_FRETS_PER_SEC = 12;
const MAX_SPAN = 4;
const STRETCH_MAX_SPAN = 5;
const MAX_STRING_SKIP = 2;
const SIXTEENTHS_PER_QUARTER = 4;

export type TabEvent = {
  bar: number;
  time: number;
  duration: number;
  string: number;
  fret: number;
  passing?: boolean;
};

export type Fingering = ReadonlyArray<Finger | null>;

export type PlayabilityOptions = { stretch?: boolean };

export type Issue =
  | { type: 'missing-finger'; index: number }
  | { type: 'span'; time: number; span: number }
  | { type: 'shift-speed'; fromIndex: number; toIndex: number; fretsPerSecond: number }
  | { type: 'string-skip'; index: number; skip: number }
  | { type: 'unreachable'; index: number }
  | { type: 'wrong-note'; index: number }
  | { type: 'bar-sum'; bar: number; total: number; expected: number };

function secondsPerSixteenth(bpm: number): number {
  return 60 / bpm / SIXTEENTHS_PER_QUARTER;
}

function checkSpans(events: TabEvent[], opts: PlayabilityOptions): Issue[] {
  const maxSpan = opts.stretch === true ? STRETCH_MAX_SPAN : MAX_SPAN;
  const byTime = new Map<number, number[]>();
  events.forEach((event) => {
    if (event.fret <= 0) return;
    const frets = byTime.get(event.time) ?? [];
    frets.push(event.fret);
    byTime.set(event.time, frets);
  });

  const issues: Issue[] = [];
  for (const [time, frets] of byTime) {
    const span = Math.max(...frets) - Math.min(...frets);
    if (span > maxSpan) issues.push({ type: 'span', time, span });
  }
  return issues;
}

// A shift is a change of hand position (fret minus finger), not a finger moving within a position.
function handPosition(event: TabEvent, finger: Finger | null | undefined): number | null {
  if (event.fret <= 0 || typeof finger !== 'number' || finger === 0) return null;
  return event.fret - finger + 1;
}

function checkShiftSpeed(events: TabEvent[], fingering: Fingering, bpm: number): Issue[] {
  const issues: Issue[] = [];
  const perSixteenth = secondsPerSixteenth(bpm);
  let last: { index: number; time: number; position: number } | null = null;

  events.forEach((event, index) => {
    const position = handPosition(event, fingering[index]);
    if (position === null) return;
    if (last !== null && event.time !== last.time && position !== last.position) {
      const seconds = (event.time - last.time) * perSixteenth;
      const fretsPerSecond = Math.abs(position - last.position) / seconds;
      if (fretsPerSecond > MAX_SHIFT_FRETS_PER_SEC) {
        issues.push({ type: 'shift-speed', fromIndex: last.index, toIndex: index, fretsPerSecond });
      }
    }
    last = { index, time: event.time, position };
  });
  return issues;
}

function checkStringSkips(events: TabEvent[]): Issue[] {
  const issues: Issue[] = [];
  for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1] as TabEvent;
    const curr = events[i] as TabEvent;
    const skip = Math.abs(curr.string - prev.string);
    if (skip > MAX_STRING_SKIP) issues.push({ type: 'string-skip', index: i, skip });
  }
  return issues;
}

export function checkPlayable(
  events: TabEvent[],
  fingering: Fingering,
  bpm: number,
  opts: PlayabilityOptions = {},
): Issue[] {
  const issues: Issue[] = [];

  events.forEach((_event, index) => {
    if (fingering[index] === null || fingering[index] === undefined) {
      issues.push({ type: 'missing-finger', index });
    }
  });

  events.forEach((event, index) => {
    if (event.fret < 0) issues.push({ type: 'unreachable', index });
  });

  issues.push(...checkSpans(events, opts));
  issues.push(...checkShiftSpeed(events, fingering, bpm));
  issues.push(...checkStringSkips(events));

  return issues;
}

export type Harmony = { root: PitchClass; tones: number[] };

export function checkHarmony(
  events: TabEvent[],
  harmony: Harmony,
  tuning: Tuning,
  capo = 0,
): Issue[] {
  const allowed = new Set(harmony.tones.map((tone) => (harmony.root + tone) % 12));
  const issues: Issue[] = [];

  events.forEach((event, index) => {
    if (event.passing === true) return;
    const stringIndex = STRING_COUNT - event.string;
    const openMidi = tuning[stringIndex];
    if (openMidi === undefined) return;
    const midi = openMidi + capo + event.fret;
    const pitchClass = ((midi % 12) + 12) % 12;
    if (!allowed.has(pitchClass)) issues.push({ type: 'wrong-note', index });
  });

  return issues;
}

export type TimeSignature = { top: number; bottom: number };

export function barLengthInSixteenths(timeSig: TimeSignature): number {
  return (timeSig.top / timeSig.bottom) * 16;
}

export function checkBars(events: TabEvent[], timeSig: TimeSignature): Issue[] {
  const expected = barLengthInSixteenths(timeSig);
  const totals = new Map<number, number>();

  events.forEach((event) => {
    totals.set(event.bar, (totals.get(event.bar) ?? 0) + event.duration);
  });

  const issues: Issue[] = [];
  for (const [bar, total] of totals) {
    if (Math.abs(total - expected) > 1e-9) issues.push({ type: 'bar-sum', bar, total, expected });
  }
  return issues;
}
