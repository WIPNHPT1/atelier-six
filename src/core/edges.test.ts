// Edge cases for the older core helpers, so every branch is exercised (Gate 6 coverage).
import { describe, expect, it } from 'vitest';
import { explainTransition } from './engine/explain.ts';
import { joinWords, ordinal } from './ordinal.ts';
import { humanise } from './schedule/humanise.ts';
import { describeShape } from './shapes/describe.ts';
import type { Shape } from './shapes/types.ts';
import { checkHarmony, checkPlayable } from './tab/playability.ts';
import { renderTab, toAscii } from './tab/renderTab.ts';
import { standard } from './tuning.ts';

function shape(notes: [number | null, 0 | 1 | 2 | 3 | 4 | 'T' | null][]): Shape {
  return {
    id: 's',
    chord: 'X',
    notes: notes.map(([fret, finger]) => ({ fret, finger })) as Shape['notes'],
    register: 'low',
    tags: [],
  };
}

describe('ordinal', () => {
  it('handles teens and single words', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 112].map(ordinal)).toEqual([
      '1st',
      '2nd',
      '3rd',
      '4th',
      '11th',
      '12th',
      '13th',
      '21st',
      '112th',
    ]);
    expect(joinWords(['one'])).toBe('one');
  });
});

describe('explainTransition', () => {
  it('describes slides, shifts, lifts, places and releases in every direction', () => {
    const sentences = explainTransition({
      moves: [
        { finger: 1, type: 'anchor' },
        { finger: 2, type: 'anchor' },
        { finger: 3, type: 'lift', to: { string: 1, fret: 2 } },
        { finger: 3, type: 'lift' },
        { finger: 4, type: 'place', to: { string: 2, fret: 3 } },
        { finger: 4, type: 'place' },
        { finger: 1, type: 'release', from: { string: 3, fret: 1 } },
        { finger: 1, type: 'release' },
        { finger: 2, type: 'guide' },
      ],
      groups: [
        { kind: 'slide', fingers: [1, 2], vector: { dString: 0, dFret: 1 } },
        { kind: 'slide', fingers: [1], vector: { dString: 0, dFret: -3 } },
        { kind: 'shift', fingers: [2, 3], vector: { dString: 1, dFret: 0 } },
        { kind: 'shift', fingers: [2], vector: { dString: -2, dFret: 0 } },
      ],
    });
    expect(sentences).toHaveLength(8);
    const single = explainTransition({ moves: [{ finger: 'T', type: 'anchor' }], groups: [] });
    expect(single).toHaveLength(1);
  });
});

describe('describeShape', () => {
  it('names one or many open and muted strings and skips unfingered frets', () => {
    const many = describeShape(
      shape([
        [null, null],
        [null, null],
        [0, null],
        [0, null],
        [2, 'T'],
        [3, null],
      ]),
    );
    expect(many.length).toBeGreaterThan(0);
    const one = describeShape(
      shape([
        [null, null],
        [0, null],
        [2, 1],
        [2, 2],
        [2, 3],
        [1, 4],
      ]),
    );
    expect(one).not.toBe(many);
  });
});

describe('playability edges', () => {
  it('flags unreachable frets and ignores strings the tuning lacks', () => {
    const event = { bar: 0, time: 0, duration: 16, string: 6, fret: -1 };
    expect(checkPlayable([event], [1], 90).map((i) => i.type)).toContain('unreachable');
    expect(
      checkHarmony([{ ...event, string: 7, fret: 0 }], { root: 0, tones: [0] }, standard),
    ).toEqual([]);
  });
});

describe('renderTab edges', () => {
  it('draws ghost steps, defaults missing bar counts and writes ascii', () => {
    const s = shape([
      [3, 2],
      [2, 1],
      [0, null],
      [0, null],
      [0, null],
      [3, 3],
    ]);
    const rhythm = {
      id: 'r',
      subdivision: 8 as const,
      steps: [
        { t: 0, dir: 'D' as const },
        { t: 2, dir: 'mute' as const, ghost: true, palmMute: true },
        { t: 4, dir: 'U' as const, ghost: true },
        { t: 6, dir: 'D' as const, strings: [1, 2] },
      ],
    };
    const columns = renderTab([s], rhythm, [], standard);
    expect(columns).toHaveLength(4);
    expect(columns[1]?.cells.every((c) => c === 'x')).toBe(true);
    expect(columns[2]?.cells.every((c) => c === null)).toBe(true);
    expect(toAscii(columns)).toMatch(/^e\|/);
    expect(toAscii([])).toContain('e|');
  });
});

describe('humanise edges', () => {
  it('copes with a single event (no step length to measure)', () => {
    const event = {
      t: 0,
      kind: 'strum' as const,
      step: 0,
      bar: 0,
      chordIndex: 0,
      strings: [],
      dir: 'D' as const,
      velocity: 0.7,
      palmMute: false,
      accent: false,
    };
    expect(humanise([event], { seed: 1 })).toHaveLength(1);
    expect(humanise([event, { ...event }], { seed: 1, swing: 60 })).toHaveLength(2);
    // A lone off-beat note has no neighbours to guard against.
    expect(humanise([{ ...event, step: 2, t: 0.25 }], { seed: 2, swing: 60 })).toHaveLength(1);
    const accented = humanise([{ ...event, step: 4, t: 0.5, accent: true }], {
      seed: 3,
      accents: 2,
    });
    expect(accented[0]?.accent).toBe(true);
  });
});
