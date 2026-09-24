import { describe, expect, it } from 'vitest';
import { checkBars, checkHarmony, checkPlayable, type TabEvent } from './playability.ts';
import { standard } from '../tuning.ts';

function event(overrides: Partial<TabEvent>): TabEvent {
  return { bar: 0, time: 0, duration: 4, string: 6, fret: 0, ...overrides };
}

describe('checkPlayable', () => {
  it('flags a fast position shift at 180 bpm but allows the same shift at 60 bpm', () => {
    const events = [event({ time: 0, fret: 2 }), event({ time: 1, fret: 4 })];
    const fingering = [1, 1] as const;

    const fast = checkPlayable(events, fingering, 180);
    expect(fast.some((issue) => issue.type === 'shift-speed')).toBe(true);

    const slow = checkPlayable(events, fingering, 60);
    expect(slow.some((issue) => issue.type === 'shift-speed')).toBe(false);
  });

  it('rejects a 6-fret span whether or not the lesson allows a stretch', () => {
    const events = [event({ time: 0, string: 6, fret: 2 }), event({ time: 0, string: 5, fret: 8 })];
    const fingering = [1, 4] as const;

    expect(checkPlayable(events, fingering, 90).some((i) => i.type === 'span')).toBe(true);
    expect(
      checkPlayable(events, fingering, 90, { stretch: true }).some((i) => i.type === 'span'),
    ).toBe(true);
  });

  it('rejects a 5-fret span unless the lesson allows a stretch', () => {
    const events = [event({ time: 0, string: 6, fret: 2 }), event({ time: 0, string: 5, fret: 7 })];
    const fingering = [1, 4] as const;

    expect(checkPlayable(events, fingering, 90).some((i) => i.type === 'span')).toBe(true);
    expect(
      checkPlayable(events, fingering, 90, { stretch: true }).some((i) => i.type === 'span'),
    ).toBe(false);
  });

  it('flags a note with no finger assigned', () => {
    const events = [event({ time: 0, fret: 2 })];
    expect(checkPlayable(events, [null], 90)).toContainEqual({ type: 'missing-finger', index: 0 });
  });
});

describe('checkHarmony', () => {
  it('rejects a chord tone outside the given harmony', () => {
    const cMajor = { root: 0, tones: [0, 4, 7] };
    const events = [
      event({ time: 0, string: 5, fret: 3 }), // A string fret 3 -> C
      event({ time: 4, string: 4, fret: 0 }), // D string open -> D, not a C major tone
    ];

    const issues = checkHarmony(events, cMajor, standard);
    expect(issues).toEqual([{ type: 'wrong-note', index: 1 }]);
  });

  it('allows a passing tone that is marked as such', () => {
    const cMajor = { root: 0, tones: [0, 4, 7] };
    const events = [event({ time: 4, string: 4, fret: 0, passing: true })];

    expect(checkHarmony(events, cMajor, standard)).toEqual([]);
  });
});

describe('checkBars', () => {
  it('flags a bar whose durations do not sum to a full bar', () => {
    const events = [event({ bar: 0, duration: 4 }), event({ bar: 0, duration: 4 })];

    const issues = checkBars(events, { top: 4, bottom: 4 });
    expect(issues).toEqual([{ type: 'bar-sum', bar: 0, total: 8, expected: 16 }]);
  });

  it('passes a bar whose durations sum exactly', () => {
    const events = [event({ bar: 0, duration: 8 }), event({ bar: 0, duration: 8 })];

    expect(checkBars(events, { top: 4, bottom: 4 })).toEqual([]);
  });
});
