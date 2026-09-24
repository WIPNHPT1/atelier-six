import { describe, expect, it } from 'vitest';
import { parseShape } from '../shapes/parseShape.ts';
import { analyseTransition } from './analyseTransition.ts';
import { explainTransition } from './explain.ts';

describe('explainTransition', () => {
  it('C open → Am open: keeps two fingers anchored, lifts the third', () => {
    const c = parseShape('C.open', 'C', 'x32010', '-32-1-');
    const am = parseShape('Am.open', 'Am', 'x02210', '--231-');

    expect(explainTransition(analyseTransition(c, am))).toEqual([
      'Keep fingers 1 and 2 where they are.',
      'Lift finger 3 to the 3rd string, 2nd fret.',
    ]);
  });

  it('Em open → Am open: shifts a pair, places a new finger', () => {
    const em = parseShape('Em.open', 'Em', '022000', '-23---');
    const am = parseShape('Am.open', 'Am', 'x02210', '--231-');

    expect(explainTransition(analyseTransition(em, am))).toEqual([
      'Move fingers 2 and 3 together across 1 string, towards the thinner strings.',
      'Place finger 1 on the 2nd string, 1st fret.',
    ]);
  });

  it('G.open.b → C open: shifts a pair, places one finger, releases another', () => {
    const gb = parseShape('G.open.b', 'G', '320003', '32---4');
    const c = parseShape('C.open', 'C', 'x32010', '-32-1-');

    expect(explainTransition(analyseTransition(gb, c))).toEqual([
      'Move fingers 2 and 3 together across 1 string, towards the thinner strings.',
      'Place finger 1 on the 2nd string, 1st fret.',
      'Release finger 4 from the 1st string.',
    ]);
  });

  it('G5 → A5: slides a group of three towards the bridge', () => {
    const g5 = parseShape('G5', 'G5', '355xxx', '134---');
    const a5 = parseShape('A5', 'A5', '577xxx', '134---');

    expect(explainTransition(analyseTransition(g5, a5))).toEqual([
      'Slide fingers 1, 3 and 4 together 2 frets towards the bridge.',
    ]);
  });
});
