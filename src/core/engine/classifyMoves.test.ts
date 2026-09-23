import { describe, expect, it } from 'vitest';
import { parseShape } from '../shapes/parseShape.ts';
import { classifyMoves } from './classifyMoves.ts';

describe('classifyMoves', () => {
  it('C open → Am open: 1 anchor, 2 anchor, 3 lift', () => {
    const c = parseShape('C.open', 'C', 'x32010', '-32-1-');
    const am = parseShape('Am.open', 'Am', 'x02210', '--231-');

    expect(classifyMoves(c, am)).toEqual([
      { finger: 1, type: 'anchor', from: { string: 4, fret: 1 }, to: { string: 4, fret: 1 } },
      { finger: 2, type: 'anchor', from: { string: 2, fret: 2 }, to: { string: 2, fret: 2 } },
      { finger: 3, type: 'lift', from: { string: 1, fret: 3 }, to: { string: 3, fret: 2 } },
    ]);
  });

  it('Em7 → G: anchors 1, 3, 4; 2 lift', () => {
    const em7 = parseShape('Em7.open', 'Em7', '022033', '-12-34');
    const g = parseShape('G.open.a', 'G', '320033', '21--34');

    const moves = classifyMoves(em7, g);
    expect(moves.map((m) => ({ finger: m.finger, type: m.type }))).toEqual([
      { finger: 1, type: 'anchor' },
      { finger: 2, type: 'lift' },
      { finger: 3, type: 'anchor' },
      { finger: 4, type: 'anchor' },
    ]);
  });

  it('a finger only in the target shape is a place, only in the source is a release', () => {
    const gb = parseShape('G.open.b', 'G', '320003', '32---4');
    const c = parseShape('C.open', 'C', 'x32010', '-32-1-');

    const moves = classifyMoves(gb, c);
    expect(moves.find((m) => m.finger === 1)).toEqual({
      finger: 1,
      type: 'place',
      to: { string: 4, fret: 1 },
    });
    expect(moves.find((m) => m.finger === 4)).toEqual({
      finger: 4,
      type: 'release',
      from: { string: 5, fret: 3 },
    });
  });

  it('a same-string fret change is a guide', () => {
    const a = parseShape('a', 'X', '1xxxxx', '1-----');
    const b = parseShape('b', 'X', '3xxxxx', '1-----');

    expect(classifyMoves(a, b)).toEqual([
      { finger: 1, type: 'guide', from: { string: 0, fret: 1 }, to: { string: 0, fret: 3 } },
    ]);
  });

  it('sorts output by finger order 1, 2, 3, 4, T', () => {
    const a = parseShape('a', 'X', '020100', 'T2-1--');
    const b = parseShape('b', 'X', '020100', 'T2-1--');

    expect(classifyMoves(a, b).map((m) => m.finger)).toEqual([1, 2, 'T']);
  });
});
