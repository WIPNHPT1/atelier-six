import { chordOfShape, splitKey } from './record.ts';
import type { TransitionRecord } from './schema.ts';

export const LEVELS = 5;

export type HeatCell = {
  from: string;
  to: string;
  // null: never tried (or the same chord on the diagonal).
  rate: number | null;
  level: number;
  key: string | null;
};

export type Heatmap = { chords: string[]; rows: HeatCell[][]; worst: HeatCell | null };

// Miss rate → one of five stepped levels (1–5); 0 means no data.
export function missLevel(rate: number | null): number {
  if (rate === null) return 0;
  return Math.min(LEVELS, Math.floor(rate * LEVELS) + 1);
}

type Pair = { from: string; to: string; key: string; attempts: number; misses: number };

function pairs(transitions: Record<string, TransitionRecord>): Pair[] {
  // Several shapes of the same chord pair fold into one chord-to-chord cell.
  const byChords = new Map<string, Pair>();
  for (const record of Object.values(transitions)) {
    const { from, to } = splitKey(record.transitionKey);
    const chordFrom = chordOfShape(from);
    const chordTo = chordOfShape(to);
    const id = `${chordFrom}>${chordTo}`;
    const existing = byChords.get(id);
    byChords.set(id, {
      from: chordFrom,
      to: chordTo,
      key: existing?.key ?? record.transitionKey,
      attempts: (existing?.attempts ?? 0) + record.attempts,
      misses: (existing?.misses ?? 0) + record.misses,
    });
  }
  return [...byChords.values()].filter((pair) => pair.attempts > 0);
}

export function buildHeatmap(transitions: Record<string, TransitionRecord>): Heatmap {
  const list = pairs(transitions);
  const chords = [...new Set(list.flatMap((pair) => [pair.from, pair.to]))];
  const rows = chords.map((from) =>
    chords.map((to): HeatCell => {
      const pair = from === to ? undefined : list.find((p) => p.from === from && p.to === to);
      const rate = pair === undefined ? null : pair.misses / pair.attempts;
      return { from, to, rate, level: missLevel(rate), key: pair?.key ?? null };
    }),
  );
  const worst =
    rows
      .flat()
      .flatMap((cell) => (cell.rate !== null && cell.rate > 0 ? [{ cell, rate: cell.rate }] : []))
      .reduce<{ cell: HeatCell; rate: number } | null>(
        (best, entry) => (best === null || entry.rate > best.rate ? entry : best),
        null,
      )?.cell ?? null;
  return { chords, rows, worst };
}

export type WorstEntry = { from: string; to: string; key: string; rate: number };

export function worstFirst(transitions: Record<string, TransitionRecord>, limit = 3): WorstEntry[] {
  return pairs(transitions)
    .map((pair) => ({
      from: pair.from,
      to: pair.to,
      key: pair.key,
      rate: pair.misses / pair.attempts,
    }))
    .filter((entry) => entry.rate > 0)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, limit);
}

// Points for a simple SVG sparkline (y grows downwards).
export function sparklinePath(values: number[], width: number, height: number): string {
  if (values.length === 0) return '';
  const max = Math.max(...values, 1);
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;
  return values
    .map((value, i) => {
      const x = values.length > 1 ? i * stepX : width / 2;
      const y = height - (value / max) * height;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}
