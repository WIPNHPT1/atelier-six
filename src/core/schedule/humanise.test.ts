import { describe, expect, it } from 'vitest';
import type { RhythmPreset } from '../../data/rhythms.ts';
import type { Shape } from '../shapes/types.ts';
import { standard } from '../tuning.ts';
import { buildSchedule } from './buildSchedule.ts';
import { humanise } from './humanise.ts';

const shape: Shape = {
  id: 'test-shape',
  chord: 'C',
  notes: [
    { fret: null, finger: null },
    { fret: 3, finger: 3 },
    { fret: 2, finger: 2 },
    { fret: 0, finger: null },
    { fret: 1, finger: 1 },
    { fret: 0, finger: null },
  ],
  register: 'mid',
  tags: [],
};

// Eight strums per bar, on every eighth note (steps 0,2,4,...,14 of 16), so half fall
// on-beat (0,4,8,12) and half off-beat (2,6,10,14) — enough to exercise swing.
const eighthNotes: RhythmPreset = {
  id: 'eighths',
  subdivision: 16,
  steps: Array.from({ length: 8 }, (_, i) => ({ t: i * 2, dir: i % 2 === 0 ? 'D' : 'U' })),
};

const BPM = 120;

function events() {
  return buildSchedule({
    shapes: [shape, shape, shape],
    rhythm: eighthNotes,
    bpm: BPM,
    bars: [1, 1, 1],
    tuning: standard,
    click: true,
  });
}

describe('humanise', () => {
  it('is deterministic for a given seed', () => {
    const a = humanise(events(), { seed: 42 });
    const b = humanise(events(), { seed: 42 });
    expect(a).toEqual(b);
  });

  it('gives a different result for a different seed', () => {
    const a = humanise(events(), { seed: 1 });
    const b = humanise(events(), { seed: 2 });
    expect(a).not.toEqual(b);
  });

  it('keeps timing jitter within the requested bound', () => {
    const timingMs = 8;
    const original = events();
    const result = humanise(original, { seed: 7, timingMs, swing: 0.5 });
    result.forEach((event, i) => {
      const before = original[i];
      if (before === undefined || event.kind === 'click') return;
      expect(Math.abs(event.t - before.t)).toBeLessThanOrEqual(timingMs / 1000 + 1e-9);
    });
  });

  it('never reorders events', () => {
    // buildSchedule doesn't emit events in time order once a click track is added
    // (each bar's clicks are appended after that bar's content), so rank by the
    // *original* t before checking that humanise preserved chronological order.
    const original = events();
    const result = humanise(original, { seed: 99, timingMs: 8, swing: 0.6 });
    const timeOrder = original
      .map((_, i) => i)
      .sort((a, b) => (original[a]?.t ?? 0) - (original[b]?.t ?? 0));
    for (let i = 1; i < timeOrder.length; i++) {
      const prev = result[timeOrder[i - 1] ?? -1];
      const curr = result[timeOrder[i] ?? -1];
      if (prev === undefined || curr === undefined) continue;
      expect(curr.t).toBeGreaterThanOrEqual(prev.t);
    }
  });

  it('keeps bar lines exact', () => {
    const original = events();
    const result = humanise(original, { seed: 3, timingMs: 8, swing: 0.6 });
    result.forEach((event, i) => {
      if (event.step % 16 !== 0) return;
      const before = original[i];
      expect(event.t).toBe(before?.t);
    });
  });

  it('leaves click (metronome) events untouched', () => {
    const original = events();
    const result = humanise(original, { seed: 5, timingMs: 8, velocityPct: 20, swing: 0.6 });
    result.forEach((event, i) => {
      if (event.kind !== 'click') return;
      expect(event).toEqual(original[i]);
    });
  });

  it('moves off-beat eighths by the swing amount at swing 0.55', () => {
    const original = events();
    const result = humanise(original, { seed: 11, timingMs: 0, velocityPct: 0, swing: 0.55 });
    const stepDur = 15 / BPM; // one sixteenth, seconds
    const expectedDelay = (0.55 - 0.5) * stepDur * 2;
    result.forEach((event, i) => {
      const before = original[i];
      if (before === undefined || event.kind === 'click') return;
      const isOffbeatEighth = before.step % 4 === 2;
      if (isOffbeatEighth) {
        expect(event.t - before.t).toBeCloseTo(expectedDelay, 6);
      } else {
        expect(event.t - before.t).toBeCloseTo(0, 6);
      }
    });
  });

  it('tightens strum spread as velocity rises (harder = tighter)', () => {
    const quiet = events().map((e) => ({ ...e, velocity: 0.3 }));
    const loud = events().map((e) => ({ ...e, velocity: 1.4 }));
    const quietOut = humanise(quiet, { seed: 21, timingMs: 0, velocityPct: 0 });
    const loudOut = humanise(loud, { seed: 21, timingMs: 0, velocityPct: 0 });
    const quietEvent = quietOut.find((e) => e.strings.length > 1);
    const loudEvent = loudOut.find((e) => e.strings.length > 1);
    expect(quietEvent).toBeDefined();
    expect(loudEvent).toBeDefined();
    const quietSpread = quietEvent?.strings.at(-1)?.offset ?? 0;
    const loudSpread = loudEvent?.strings.at(-1)?.offset ?? 0;
    expect(loudSpread).toBeLessThan(quietSpread);
  });

  it('never produces negative or undefined velocity', () => {
    const result = humanise(events(), { seed: 13, velocityPct: 1000 });
    result.forEach((event) => {
      expect(event.velocity).toBeGreaterThanOrEqual(0);
    });
  });
});
