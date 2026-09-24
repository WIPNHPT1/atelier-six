import { describe, expect, it } from 'vitest';
import tunesData from '../../data/tunes.json' with { type: 'json' };
import { STYLES } from '../../data/styles/index.ts';
import { totalSeconds } from '../schedule/arrangement.ts';
import { lintAgainstStyle } from '../style/lint.ts';
import type { StyleSheet } from '../style/types.ts';
import { checkBars } from '../tab/playability.ts';
import { checkLesson } from './check.ts';
import type { TunesData } from './types.ts';

const DATA = tunesData as TunesData;
const MIN_SECONDS = 120;
const MAX_SECONDS = 180;

describe('module tunes', () => {
  it('has one tune for each of modules 1 and 2', () => {
    expect(DATA.tunes.map((tune) => tune.module)).toEqual(['power', 'open']);
  });

  for (const tune of DATA.tunes) {
    it(`${tune.title} lasts 2–3 minutes, follows its structure and passes every check`, () => {
      const style = STYLES[tune.module] as StyleSheet;
      const bars = tune.arrangement.sections.reduce((sum, section) => sum + section.bars, 0);
      const seconds = totalSeconds(bars, tune.targetBpm);
      expect(seconds).toBeGreaterThanOrEqual(MIN_SECONDS);
      expect(seconds).toBeLessThanOrEqual(MAX_SECONDS);
      expect(tune.arrangement.sections[0]?.name).toBe('intro');
      expect(tune.arrangement.sections.at(-1)?.name).toBe('chorus');
      expect(checkLesson(tune, style)).toEqual([]);
    });
  }
});

describe('riffs of the week', () => {
  it('has two per module, unlocked after lessons 3 and 6', () => {
    for (const module of ['power', 'open']) {
      expect(DATA.riffs.filter((r) => r.module === module).map((r) => r.unlockAfter)).toEqual([
        3, 6,
      ]);
    }
  });

  for (const riff of DATA.riffs) {
    it(`${riff.title} is 4–8 bars and in style`, () => {
      expect(riff.bars).toBeGreaterThanOrEqual(4);
      expect(riff.bars).toBeLessThanOrEqual(8);
      const events = riff.piece.sections.flatMap((section) => section.events);
      expect(new Set(events.map((event) => event.bar)).size).toBe(riff.bars);
      const tab = events.map((e) => ({ ...e, time: e.bar * 16 + e.t }));
      expect(checkBars(tab, { top: 4, bottom: 4 })).toEqual([]);
      expect(lintAgainstStyle(riff.piece, STYLES[riff.module] as StyleSheet)).toEqual([]);
    });
  }
});
