import { describe, expect, it } from 'vitest';
import { STYLES } from '../../data/styles/index.ts';
import { checkBars, checkHarmony, checkPlayable } from '../tab/playability.ts';
import { lintAgainstStyle } from './lint.ts';
import { buildRiff, TUNINGS, type Difficulty } from './riffBuilder.ts';
import type { StyleSheet } from './types.ts';

const KEYS: Record<string, number> = { power: 4, open: 7, lead: 9, thumb: 2, whammy: 2 };
const SEEDS = Array.from({ length: 20 }, (_, seed) => seed + 1);

describe('buildRiff', () => {
  for (const [id, style] of Object.entries(STYLES)) {
    it(`builds ${id} riffs that pass every check and lint clean across 20 seeds`, () => {
      for (const seed of SEEDS) {
        const difficulty = ((seed % 3) + 1) as Difficulty;
        const riff = buildRiff(style, { key: KEYS[id] ?? 0, bars: 4, seed, difficulty });
        const tuning = TUNINGS[riff.piece.tuning];
        expect(checkPlayable(riff.tab, riff.fingering, style.tempo.max)).toEqual([]);
        expect(checkBars(riff.tab, { top: 4, bottom: 4 })).toEqual([]);
        riff.tab.forEach((event, i) => {
          expect(
            checkHarmony([event], riff.harmonies[i] ?? { root: 0, tones: [] }, tuning),
          ).toEqual([]);
        });
        expect(lintAgainstStyle(riff.piece, style)).toEqual([]);
      }
    });
  }

  it('is deterministic for a seed and varies across seeds', () => {
    const style = STYLES.power as StyleSheet;
    const a = buildRiff(style, { key: 4, bars: 4, seed: 7, difficulty: 2 });
    const b = buildRiff(style, { key: 4, bars: 4, seed: 7, difficulty: 2 });
    expect(a).toEqual(b);
    const others = SEEDS.map(
      (seed) => buildRiff(style, { key: 4, bars: 4, seed, difficulty: 2 }).tab,
    );
    expect(others.some((tab) => JSON.stringify(tab) !== JSON.stringify(a.tab))).toBe(true);
  });

  it('pushes a chord change onto the "and" of 4 in pop punk', () => {
    const riff = buildRiff(STYLES.power as StyleSheet, { key: 4, bars: 2, seed: 3, difficulty: 1 });
    const events = riff.piece.sections[0]?.events ?? [];
    const push = events.find((event) => event.bar === 0 && event.t === 14);
    expect(push?.chord).toEqual(events.find((event) => event.bar === 1)?.chord);
  });

  it('throws when the style has nothing to build from', () => {
    const style = { ...(STYLES.power as StyleSheet), strings: [] };
    expect(() => buildRiff(style, { key: 0, bars: 2, seed: 1, difficulty: 1 })).toThrow(/power/);
  });

  it('throws when every attempt fails the playability checks', () => {
    const style: StyleSheet = {
      ...(STYLES.thumb as StyleSheet),
      strings: [1, 6],
      phraseShapes: [{ id: 'leap', contour: [0, 40] }],
    };
    expect(() => buildRiff(style, { key: 0, bars: 2, seed: 1, difficulty: 1 })).toThrow(/playable/);
  });
});
