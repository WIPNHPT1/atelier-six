import { describe, expect, it } from 'vitest';
import type { Shape } from '../shapes/types.ts';
import { remainingFromBar } from './remainingFromBar.ts';

function makeShape(id: string): Shape {
  return {
    id,
    chord: id,
    notes: [
      { fret: null, finger: null },
      { fret: 0, finger: null },
      { fret: 0, finger: null },
      { fret: 0, finger: null },
      { fret: 0, finger: null },
      { fret: 0, finger: null },
    ],
    register: 'mid',
    tags: [],
  };
}

const C = makeShape('C');
const G = makeShape('G');
const Am = makeShape('Am');

describe('remainingFromBar', () => {
  it('returns everything unchanged when resuming at bar 0', () => {
    expect(remainingFromBar([C, G], [2, 3], 0)).toEqual({ shapes: [C, G], bars: [2, 3] });
  });

  it('splits mid-way through the first chord', () => {
    expect(remainingFromBar([C, G], [2, 3], 1)).toEqual({ shapes: [C, G], bars: [1, 3] });
  });

  it('drops a chord entirely once its bars are fully behind the resume point', () => {
    expect(remainingFromBar([C, G, Am], [2, 3, 1], 2)).toEqual({ shapes: [G, Am], bars: [3, 1] });
  });

  it('splits mid-way through a later chord', () => {
    expect(remainingFromBar([C, G, Am], [2, 3, 1], 3)).toEqual({ shapes: [G, Am], bars: [2, 1] });
  });

  it('returns nothing once the resume point is past every bar', () => {
    expect(remainingFromBar([C, G], [2, 3], 5)).toEqual({ shapes: [], bars: [] });
  });

  it('clamps a resume point before bar 0 to the start of the first chord', () => {
    expect(remainingFromBar([C, G], [2, 3], -4)).toEqual({ shapes: [C, G], bars: [2, 3] });
  });

  it('treats a chord with no bars entry as contributing zero bars', () => {
    expect(remainingFromBar([C, G], [2], 3)).toEqual({ shapes: [], bars: [] });
  });
});
