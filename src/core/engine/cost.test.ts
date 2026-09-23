import { describe, expect, it } from 'vitest';
import { parseShape } from '../shapes/parseShape.ts';
import { analyseTransition } from './analyseTransition.ts';
import { moveCost, shapeDifficulty, transitionCost } from './cost.ts';

describe('transitionCost', () => {
  it('Em open → Am open: place(2) + shift group(1.5) = 3.5', () => {
    const em = parseShape('Em.open', 'Em', '022000', '-23---');
    const am = parseShape('Am.open', 'Am', 'x02210', '--231-');
    expect(transitionCost(analyseTransition(em, am))).toBe(3.5);
  });

  it('G.open.b → C open: place(2) + release(0) + shift group(1.5) = 3.5', () => {
    const gb = parseShape('G.open.b', 'G', '320003', '32---4');
    const c = parseShape('C.open', 'C', 'x32010', '-32-1-');
    expect(transitionCost(analyseTransition(gb, c))).toBe(3.5);
  });

  it('G5 → A5: slide group only, 1 + 0.2*2 = 1.4', () => {
    const g5 = parseShape('G5', 'G5', '355xxx', '134---');
    const a5 = parseShape('A5', 'A5', '577xxx', '134---');
    expect(transitionCost(analyseTransition(g5, a5))).toBe(1.4);
  });

  it('G5 → C5: shift group only, 1.5 + 0.25*0 = 1.5', () => {
    const g5 = parseShape('G5', 'G5', '355xxx', '134---');
    const c5 = parseShape('C5', 'C5', 'x355xx', '-134--');
    expect(transitionCost(analyseTransition(g5, c5))).toBe(1.5);
  });

  it('all anchors → cost 0', () => {
    const a = parseShape('a', 'X', '020100', 'T2-1--');
    const b = parseShape('b', 'X', '020100', 'T2-1--');
    expect(transitionCost(analyseTransition(a, b))).toBe(0);
  });

  it('a lone ungrouped guide move: 1 + 0.25*2 = 1.5', () => {
    const a = parseShape('a', 'X', '1xxxxx', '1-----');
    const b = parseShape('b', 'X', '3xxxxx', '1-----');
    expect(transitionCost(analyseTransition(a, b))).toBe(1.5);
  });

  it('a lone ungrouped lift move: 3 + 0.3*sqrt(5) = 3.67', () => {
    const em7 = parseShape('Em7.open', 'Em7', '022033', '-12-34');
    const g = parseShape('G.open.a', 'G', '320033', '21--34');
    expect(transitionCost(analyseTransition(em7, g))).toBe(3.67);
  });
});

describe('moveCost', () => {
  it('a grouped move costs nothing on its own (its cost is counted via the group)', () => {
    expect(moveCost({ finger: 1, type: 'group', groupIndex: 0 })).toBe(0);
  });

  it('guide/lift moves without endpoints fall back to a zero delta', () => {
    expect(moveCost({ finger: 1, type: 'guide' })).toBe(1);
    expect(moveCost({ finger: 1, type: 'lift' })).toBe(3);
  });
});

describe('shapeDifficulty', () => {
  it('E-shape F barre: span 2 (free), barre +2 → 2', () => {
    const f = parseShape('F.barre', 'F', '133211', '134211', {
      barre: { fret: 1, from: 0, to: 5, finger: 1 },
    });
    expect(shapeDifficulty(f)).toBe(2);
  });

  it('C open (x32010): no interior mutes, span within free range → 0', () => {
    const c = parseShape('C.open', 'C', 'x32010', '-32-1-');
    expect(shapeDifficulty(c)).toBe(0);
  });

  it('x3x010-style shape: 1 interior mute → 0.5', () => {
    const shape = parseShape('shape', 'X', 'x3x010', '-3-1--');
    expect(shapeDifficulty(shape)).toBe(0.5);
  });

  it('a thumb fretting note adds 1', () => {
    const shape = parseShape('E7.thumb', 'E7', '020100', 'T2-1--');
    expect(shapeDifficulty(shape)).toBe(1);
  });
});
