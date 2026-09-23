import { describe, expect, it } from 'vitest';
import { dropD, halfDown, openStringMidi, standard } from './tuning.ts';

describe('tunings', () => {
  it('standard is EADGBE as MIDI notes', () => {
    expect(standard).toEqual([40, 45, 50, 55, 59, 64]);
  });

  it('halfDown lowers every string by one semitone', () => {
    expect(halfDown).toEqual([39, 44, 49, 54, 58, 63]);
  });

  it('dropD lowers only the low string, by a whole tone', () => {
    expect(dropD).toEqual([38, 45, 50, 55, 59, 64]);
  });
});

describe('openStringMidi', () => {
  it('returns the tuning unchanged with no capo', () => {
    expect(openStringMidi(standard)).toEqual(standard);
  });

  it('shifts every open string up by the capo fret', () => {
    expect(openStringMidi(standard, 2)).toEqual([42, 47, 52, 57, 61, 66]);
  });
});
