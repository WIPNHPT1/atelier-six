import { describe, expect, it } from 'vitest';
import type { Shape, StringNote } from './types.ts';
import { validateShape } from './validateShape.ts';

const muted: StringNote = { fret: null, finger: null };

function shapeWith(notes: Shape['notes'], barre?: Shape['barre']): Shape {
  return {
    id: 'test',
    chord: 'Test',
    notes,
    register: 'low',
    tags: [],
    ...(barre ? { barre } : {}),
  };
}

describe('validateShape', () => {
  it('accepts a valid open C shape', () => {
    const shape = shapeWith([
      muted,
      { fret: 3, finger: 3 },
      { fret: 2, finger: 2 },
      { fret: 0, finger: 0 },
      { fret: 1, finger: 1 },
      { fret: 0, finger: 0 },
    ]);

    expect(validateShape(shape)).toEqual([]);
  });

  it('accepts a barre shape where finger 1 covers the barre at one fret', () => {
    const shape = shapeWith(
      [
        { fret: 3, finger: 1 },
        { fret: 5, finger: 3 },
        { fret: 5, finger: 4 },
        { fret: 4, finger: 2 },
        { fret: 3, finger: 1 },
        { fret: 3, finger: 1 },
      ],
      { fret: 3, from: 0, to: 5, finger: 1 },
    );

    expect(validateShape(shape)).toEqual([]);
  });

  it('flags a finger on a muted string', () => {
    const shape = shapeWith([{ fret: null, finger: 1 }, muted, muted, muted, muted, muted]);

    expect(validateShape(shape)).toEqual(['String 0: finger 1 on an open/muted string']);
  });

  it('flags a finger on an open string', () => {
    const shape = shapeWith([{ fret: 0, finger: 2 }, muted, muted, muted, muted, muted]);

    expect(validateShape(shape)).toEqual(['String 0: finger 2 on an open/muted string']);
  });

  it('flags a fretted note with no finger and no covering barre', () => {
    const shape = shapeWith([{ fret: 3, finger: null }, muted, muted, muted, muted, muted]);

    expect(validateShape(shape)).toEqual(['String 0: fretted note has no finger']);
  });

  it('does not flag a fretted note with no finger when covered by the barre', () => {
    const shape = shapeWith(
      [
        { fret: 3, finger: null },
        { fret: 5, finger: 3 },
        { fret: 5, finger: 4 },
        { fret: 4, finger: 2 },
        muted,
        muted,
      ],
      { fret: 3, from: 0, to: 0, finger: 1 },
    );

    expect(validateShape(shape)).toEqual([]);
  });

  it('flags the same finger used on two different frets', () => {
    const shape = shapeWith([
      { fret: 1, finger: 1 },
      { fret: 2, finger: 1 },
      muted,
      muted,
      muted,
      muted,
    ]);

    expect(validateShape(shape)).toEqual(['Finger 1 is used on more than one fret']);
  });

  it('flags a span greater than 5 frets', () => {
    const shape = shapeWith([
      { fret: 1, finger: 1 },
      { fret: 7, finger: 4 },
      muted,
      muted,
      muted,
      muted,
    ]);

    expect(validateShape(shape)).toEqual(['Span of 6 frets exceeds 5']);
  });

  it('flags a thumb not on string 0 or 1', () => {
    const shape = shapeWith([muted, muted, { fret: 2, finger: 'T' }, muted, muted, muted]);

    expect(validateShape(shape)).toEqual(['String 2: thumb must be on string 0 or 1']);
  });

  it('accepts a thumb on string 0 or 1', () => {
    const shape = shapeWith([{ fret: 2, finger: 'T' }, muted, muted, muted, muted, muted]);

    expect(validateShape(shape)).toEqual([]);
  });

  it('flags a barre whose finger is not 1', () => {
    const shape = shapeWith(
      [
        { fret: 3, finger: 2 },
        { fret: 5, finger: 3 },
        { fret: 5, finger: 4 },
        { fret: 4, finger: 2 },
        { fret: 3, finger: 2 },
        { fret: 3, finger: 2 },
      ],
      { fret: 3, from: 0, to: 5, finger: 2 as unknown as 1 },
    );

    expect(validateShape(shape)).toContain('Barre finger must be 1');
  });
});
