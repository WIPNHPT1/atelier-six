import type { Finger } from '../shapes/types.ts';
import type { TabEvent } from '../tab/playability.ts';

const STRINGS_LOW_TO_HIGH = [6, 5, 4, 3, 2, 1];
const STEPS_PER_BAR = 16;
const POSITIONS = 5;
export const WARMUP_BPM = 60;

// Finger-independence orders, one per day in turn; 1-2-3-4 is the plain chromatic walk.
export const PATTERNS: readonly (readonly [Finger, Finger, Finger, Finger])[] = [
  [1, 2, 3, 4],
  [1, 3, 2, 4],
  [1, 4, 2, 3],
];

export type Warmup = {
  pattern: readonly Finger[];
  position: number;
  bpm: number;
  events: TabEvent[];
  fingering: Finger[];
};

function dayNumber(day: string): number {
  const [year = 0, month = 1, date = 1] = day.split('-').map(Number);
  const days = Math.floor(Date.UTC(year, month - 1, date) / 86_400_000);
  // An unreadable day falls back to the first pattern and position.
  return Number.isFinite(days) ? days : 0;
}

// Sixteenth notes up the strings and back down in one position: three bars, deterministic per day.
export function warmupFor(day: string): Warmup {
  const n = dayNumber(day);
  const pattern = PATTERNS[n % PATTERNS.length] as (typeof PATTERNS)[number];
  const position = 1 + (n % POSITIONS);
  const route = [...STRINGS_LOW_TO_HIGH, ...[...STRINGS_LOW_TO_HIGH].reverse()];
  const notes = route.flatMap((string, leg) => {
    const fingers = leg < STRINGS_LOW_TO_HIGH.length ? pattern : [...pattern].reverse();
    return fingers.map((finger) => ({ string, finger }));
  });
  const events = notes.map(({ string, finger }, time) => ({
    bar: Math.floor(time / STEPS_PER_BAR),
    time,
    duration: 1,
    string,
    fret: position + (finger as number) - 1,
    // A chromatic exercise, not harmony: every note is a passing note.
    passing: true,
  }));
  return {
    pattern,
    position,
    bpm: WARMUP_BPM,
    events,
    fingering: notes.map((note) => note.finger),
  };
}

// Plain-text tab, high e on top, one column per note.
export function warmupAscii(warmup: Warmup): string {
  const names = ['e', 'B', 'G', 'D', 'A', 'E'];
  return names
    .map((name, row) => {
      const string = row + 1;
      const cells = warmup.events.map((event) =>
        event.string === string ? String(event.fret).padEnd(2, '-') : '--',
      );
      return `${name}|-${cells.join('-')}-|`;
    })
    .join('\n');
}
