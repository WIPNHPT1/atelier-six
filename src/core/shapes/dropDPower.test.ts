import { describe, expect, it } from 'vitest';
import { dropDPower } from './dropDPower';

describe('dropDPower', () => {
  it('gives the open D5 no barre and finger-free open notes', () => {
    const shape = dropDPower(2);
    expect(shape.chord).toBe('D5');
    expect(shape.barre).toBeUndefined();
    expect(shape.notes.slice(0, 3)).toEqual([
      { fret: 0, finger: null },
      { fret: 0, finger: null },
      { fret: 0, finger: null },
    ]);
    expect(shape.notes.slice(3)).toEqual([
      { fret: null, finger: null },
      { fret: null, finger: null },
      { fret: null, finger: null },
    ]);
  });

  it('barres strings 0-2 with one finger for a fretted root', () => {
    const shape = dropDPower(4); // E, two frets above open D
    expect(shape.chord).toBe('E5');
    expect(shape.barre).toEqual({ fret: 2, from: 0, to: 2, finger: 1 });
    expect(shape.notes.slice(0, 3)).toEqual([
      { fret: 2, finger: 1 },
      { fret: 2, finger: 1 },
      { fret: 2, finger: 1 },
    ]);
  });

  it('tags the shape for power-chord and drop-D candidate lists', () => {
    expect(dropDPower(9).tags).toEqual(['power', 'dropD']);
  });

  it('wraps around the octave for a root below the open string', () => {
    expect(dropDPower(0).barre?.fret).toBe(10); // C is 10 semitones above open D
  });
});
