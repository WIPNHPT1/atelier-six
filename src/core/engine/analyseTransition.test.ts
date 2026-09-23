import { describe, expect, it } from 'vitest';
import { parseShape } from '../shapes/parseShape.ts';
import { analyseTransition } from './analyseTransition.ts';

describe('analyseTransition', () => {
  it('Em open → Am open: shift group {2,3} vector (1,0); 1 place', () => {
    const em = parseShape('Em.open', 'Em', '022000', '-23---');
    const am = parseShape('Am.open', 'Am', 'x02210', '--231-');

    const { groups, moves } = analyseTransition(em, am);

    expect(groups).toEqual([{ kind: 'shift', fingers: [2, 3], vector: { dString: 1, dFret: 0 } }]);
    expect(moves.find((m) => m.finger === 1)).toMatchObject({ type: 'place' });
    expect(moves.filter((m) => m.finger === 2 || m.finger === 3)).toEqual([
      {
        finger: 2,
        type: 'group',
        groupIndex: 0,
        from: { string: 1, fret: 2 },
        to: { string: 2, fret: 2 },
      },
      {
        finger: 3,
        type: 'group',
        groupIndex: 0,
        from: { string: 2, fret: 2 },
        to: { string: 3, fret: 2 },
      },
    ]);
  });

  it('G.open.b → C open: shift group {2,3} vector (1,0); 4 release; 1 place', () => {
    const gb = parseShape('G.open.b', 'G', '320003', '32---4');
    const c = parseShape('C.open', 'C', 'x32010', '-32-1-');

    const { groups, moves } = analyseTransition(gb, c);

    expect(groups).toEqual([{ kind: 'shift', fingers: [2, 3], vector: { dString: 1, dFret: 0 } }]);
    expect(moves.find((m) => m.finger === 1)).toMatchObject({ type: 'place' });
    expect(moves.find((m) => m.finger === 4)).toMatchObject({ type: 'release' });
  });

  it('G5 → A5: slide group {1,3,4} vector (0,2)', () => {
    const g5 = parseShape('G5', 'G5', '355xxx', '134---');
    const a5 = parseShape('A5', 'A5', '577xxx', '134---');

    const { groups } = analyseTransition(g5, a5);

    expect(groups).toEqual([
      { kind: 'slide', fingers: [1, 3, 4], vector: { dString: 0, dFret: 2 } },
    ]);
  });

  it('G5 → C5: shift group {1,3,4} vector (1,0)', () => {
    const g5 = parseShape('G5', 'G5', '355xxx', '134---');
    const c5 = parseShape('C5', 'C5', 'x355xx', '-134--');

    const { groups } = analyseTransition(g5, c5);

    expect(groups).toEqual([
      { kind: 'shift', fingers: [1, 3, 4], vector: { dString: 1, dFret: 0 } },
    ]);
  });

  it('two different vectors with >=2 fingers each make two groups, ordered by lowest finger', () => {
    const a = parseShape('a', 'X', '11x22x', '12-34-');
    const b = parseShape('b', 'X', 'x1144x', '-1234-');

    const { groups } = analyseTransition(a, b);

    expect(groups).toEqual([
      { kind: 'shift', fingers: [1, 2], vector: { dString: 1, dFret: 0 } },
      { kind: 'slide', fingers: [3, 4], vector: { dString: 0, dFret: 2 } },
    ]);
  });

  it('never groups anchors, even when several share vector (0,0)', () => {
    const a = parseShape('a', 'X', '020100', 'T2-1--');
    const b = parseShape('b', 'X', '020100', 'T2-1--');

    const { groups, moves } = analyseTransition(a, b);

    expect(groups).toEqual([]);
    expect(moves.every((m) => m.type === 'anchor')).toBe(true);
  });
});
