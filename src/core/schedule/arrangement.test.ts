import { describe, expect, it } from 'vitest';
import { getShapes } from '../shapes/library.ts';
import type { Shape } from '../shapes/types.ts';
import { renderTab } from '../tab/renderTab.ts';
import { standard } from '../tuning.ts';
import { chainSchedules, chainTab, totalSeconds } from './arrangement.ts';
import { buildSchedule, stepDurSeconds } from './buildSchedule.ts';

const C = getShapes('C')[0] as Shape;
const G = getShapes('G')[0] as Shape;
const rhythm = {
  id: 'q',
  subdivision: 16 as const,
  steps: [0, 8].map((t) => ({ t, dir: 'D' as const })),
};

describe('chainSchedules', () => {
  it('plays sections back to back with global bars and one count-in', () => {
    const bpm = 100;
    const first = buildSchedule({
      shapes: [C, G],
      rhythm,
      bpm,
      bars: [1, 1],
      tuning: standard,
      countIn: true,
    });
    const second = buildSchedule({
      shapes: [G],
      rhythm,
      bpm,
      bars: [1],
      tuning: standard,
      countIn: true,
    });
    const events = chainSchedules(
      [
        { events: first, bars: 2 },
        { events: second, bars: 1 },
      ],
      bpm,
    );
    expect(events.filter((e) => e.bar === -1)).toHaveLength(4);
    const last = events.at(-1);
    expect(last).toMatchObject({ bar: 2, chordIndex: 2, step: 40 });
    expect(last?.t).toBeCloseTo(40 * stepDurSeconds(bpm));
    expect(totalSeconds(3, bpm)).toBeCloseTo(48 * stepDurSeconds(bpm));
  });
});

describe('chainTab', () => {
  it('joins section tabs and labels each section start', () => {
    const a = renderTab([C, G], rhythm, [1, 1], standard);
    const b = renderTab([G], rhythm, [1], standard);
    const tab = chainTab([
      { columns: a, shapes: [C, G], bars: 2, label: 'Verse' },
      { columns: b, shapes: [G], bars: 1, label: 'Chorus' },
    ]);
    expect(tab.sectionLabels).toEqual({ 0: 'Verse', 2: 'Chorus' });
    expect(tab.shapes).toEqual([C, G, G]);
    expect(tab.columns.at(-1)).toMatchObject({ bar: 2, chordIndex: 2 });
  });
});
