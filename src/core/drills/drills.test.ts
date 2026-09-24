import { describe, expect, it } from 'vitest';
import { buildSchedule, stepDurSeconds } from '../schedule/buildSchedule.ts';
import { getShapes } from '../shapes/library.ts';
import type { Shape } from '../shapes/types.ts';
import { standard } from '../tuning.ts';
import {
  activeFreeze,
  activeMark,
  applyFreezes,
  earlyChangeMarks,
  hardestTransition,
  twoChordLoop,
} from './drills.ts';
import {
  MINUTE_MS,
  isFinished,
  isRunning,
  newMinute,
  recordChange,
  remainingMs,
  startMinute,
} from './minute.ts';

const C = getShapes('C')[0] as Shape;
const G = getShapes('G')[0] as Shape;
const Am = getShapes('Am')[0] as Shape;
const quarters = {
  id: 'quarters',
  subdivision: 16 as const,
  steps: [0, 4, 8, 12].map((t) => ({ t, dir: 'D' as const })),
};

describe('drill schedules', () => {
  it('loops two chords for two bars each', () => {
    expect(twoChordLoop(C, G)).toEqual({ shapes: [C, G], bars: [2, 2] });
  });

  it("marks beat 4 of each chord's last bar as change now", () => {
    const marks = earlyChangeMarks([2, 2]);
    expect(marks).toEqual([
      { step: 28, target: 1 },
      { step: 60, target: 0 },
    ]);
    expect(activeMark(marks, 29)).toEqual({ step: 28, target: 1 });
    expect(activeMark(marks, 32)).toBeUndefined();
  });

  it('freezes on the first strum of each chord and pushes the rest later', () => {
    const bpm = 120;
    const events = buildSchedule({
      shapes: [C, G],
      rhythm: quarters,
      bpm,
      bars: [1, 1],
      tuning: standard,
      click: true,
      countIn: true,
    });
    const { events: frozen, windows } = applyFreezes(events, bpm, 2);
    const perStep = stepDurSeconds(bpm);
    expect(windows).toEqual([
      { fromStep: 0, toStep: Math.round(2 / perStep), chordIndex: 0 },
      {
        fromStep: 16 + Math.round(2 / perStep),
        toStep: 16 + 2 * Math.round(2 / perStep),
        chordIndex: 1,
      },
    ]);
    const firstG = frozen.find((event) => event.kind !== 'click' && event.chordIndex === 1);
    expect(firstG?.t).toBeCloseTo(16 * perStep + 2);
    const countIn = frozen.filter((event) => event.bar === -1);
    expect(countIn.every((event) => event.t < 0)).toBe(true);
    expect(activeFreeze(windows, 3)?.chordIndex).toBe(0);
    expect(activeFreeze(windows, 16)).toBeUndefined();
  });

  it('picks the costliest change and ignores repeats', () => {
    expect(hardestTransition([C, C])).toBeNull();
    const pair = hardestTransition([C, Am, G]);
    expect(pair).not.toBeNull();
    expect([C.id, Am.id, G.id]).toContain(pair?.from.id);
  });
});

describe('one-minute changes', () => {
  it('counts changes only while the minute runs', () => {
    let session = newMinute();
    expect(remainingMs(session, 0)).toBe(MINUTE_MS);
    expect(recordChange(session, 0).changes).toBe(0);
    session = startMinute(1000);
    expect(isRunning(session, 1000)).toBe(true);
    session = recordChange(session, 2000);
    session = recordChange(session, 3000);
    expect(session.changes).toBe(2);
    expect(remainingMs(session, 31_000)).toBe(30_000);
    expect(isFinished(session, 61_000)).toBe(true);
    expect(recordChange(session, 61_001).changes).toBe(2);
    expect(isFinished(newMinute(), 0)).toBe(false);
  });
});
