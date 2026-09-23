import { describe, expect, it } from 'vitest';
import { parseShape } from './parseShape.ts';
import { pitchesOf } from './pitchesOf.ts';

const STANDARD_TUNING = [40, 45, 50, 55, 59, 64];

describe('pitchesOf', () => {
  it('gives the MIDI note per string for an open shape', () => {
    const shape = parseShape('C.open.a', 'C', 'x32010', '-32-1-');

    expect(pitchesOf(shape, STANDARD_TUNING)).toEqual([null, 48, 52, 55, 60, 64]);
  });

  it('returns null for muted strings', () => {
    const shape = parseShape('A.open', 'A', 'x02220', '--123-');

    expect(pitchesOf(shape, STANDARD_TUNING)[0]).toBeNull();
  });

  it('shifts every sounding string up by the capo amount', () => {
    const shape = parseShape('C.open.a', 'C', 'x32010', '-32-1-');

    expect(pitchesOf(shape, STANDARD_TUNING, 2)).toEqual([null, 50, 54, 57, 62, 66]);
  });
});
