import { describe, expect, it } from 'vitest';
import { lowestRootMidi } from './rootMidi';
import { standard } from '../tuning';
import type { Shape } from '../shapes/types';

function shape(frets: (number | null)[]): Shape {
  return {
    id: 's',
    chord: 'X',
    notes: frets.map((fret) => ({ fret, finger: null })) as Shape['notes'],
    register: 'low',
    tags: [],
  };
}

describe('lowestRootMidi', () => {
  it('finds the root on the open low string', () => {
    // Low E open (midi 40, pitch class 4 = E), rest muted.
    const s = shape([0, null, null, null, null, null]);
    expect(lowestRootMidi(s, 4, standard, 0)).toBe(40);
  });

  it('finds the root on a fretted string when the lowest string is muted', () => {
    // Low E muted, A string (midi 45) fret 3 → midi 48, pitch class 0 = C.
    const s = shape([null, 3, null, null, null, null]);
    expect(lowestRootMidi(s, 0, standard, 0)).toBe(48);
  });

  it('applies the capo offset', () => {
    const s = shape([0, null, null, null, null, null]);
    // Low E + capo 2 = midi 42, pitch class 6 (F#).
    expect(lowestRootMidi(s, 6, standard, 2)).toBe(42);
  });

  it('falls back to the lowest sounding note when no string plays the root pitch class', () => {
    const s = shape([0, null, null, null, null, null]);
    // Pitch class 9 (A) never appears in this shape.
    expect(lowestRootMidi(s, 9, standard, 0)).toBe(40);
  });

  it('returns null when every string is muted', () => {
    const s = shape([null, null, null, null, null, null]);
    expect(lowestRootMidi(s, 4, standard, 0)).toBeNull();
  });
});
