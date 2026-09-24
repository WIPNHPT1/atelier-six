import { describe, expect, it } from 'vitest';
import { describeShape } from './describe.ts';
import { parseShape } from './parseShape.ts';

describe('describeShape', () => {
  it('describes fretted notes, open strings and mutes for an open chord', () => {
    const shape = parseShape('C.open.a', 'C', 'x32010', '-32-1-');

    expect(describeShape(shape)).toBe(
      'C: 3rd finger 5th string fret 3, 2nd finger 4th string fret 2, ' +
        '1st finger 2nd string fret 1, 3rd and 1st strings open, 6th string muted',
    );
  });

  it('describes a barre and a fretted note that sits outside it', () => {
    const shape = parseShape('F.custom', 'F', 'x22422', '-11311', {
      barre: { fret: 2, from: 1, to: 5, finger: 1 },
    });

    expect(describeShape(shape)).toBe(
      'F: 1st finger barre 5th to 1st string fret 2, 3rd finger 3rd string fret 4, 6th string muted',
    );
  });

  it('lists three or more strings with a comma and "and"', () => {
    const shape = parseShape('E.open', 'E', '022100', '-231--');

    expect(describeShape(shape)).toBe(
      'E: 2nd finger 5th string fret 2, 3rd finger 4th string fret 2, 1st finger 3rd string fret 1, ' +
        '6th, 2nd and 1st strings open',
    );
  });

  it('uses "thumb" for a thumb-fretted note', () => {
    const shape = parseShape('Fsm.thumb', 'F#m', '200000', 'T-----');

    expect(describeShape(shape)).toBe(
      'F#m: thumb finger 6th string fret 2, 5th, 4th, 3rd, 2nd and 1st strings open',
    );
  });
});
