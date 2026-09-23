import { describe, expect, it } from 'vitest';
import { parseShape } from './parseShape.ts';

describe('parseShape', () => {
  it('parses the C open shape from compact notation', () => {
    const shape = parseShape('C.open.a', 'C', 'x32010', '-32-1-');

    expect(shape).toEqual({
      id: 'C.open.a',
      chord: 'C',
      notes: [
        { fret: null, finger: null },
        { fret: 3, finger: 3 },
        { fret: 2, finger: 2 },
        { fret: 0, finger: 0 },
        { fret: 1, finger: 1 },
        { fret: 0, finger: 0 },
      ],
      register: 'low',
      tags: [],
    });
  });

  it('applies opts for register, tags and barre', () => {
    const shape = parseShape('G.barre', 'G', '355433', '134211', {
      register: 'mid',
      tags: ['barre'],
      barre: { fret: 3, from: 0, to: 5, finger: 1 },
    });

    expect(shape.register).toBe('mid');
    expect(shape.tags).toEqual(['barre']);
    expect(shape.barre).toEqual({ fret: 3, from: 0, to: 5, finger: 1 });
  });

  it('parses double-digit frets with the (n) notation', () => {
    const shape = parseShape('D.barre.10', 'D', 'x(10)(12)(12)(12)(10)', '134211');

    expect(shape.notes.map((note) => note.fret)).toEqual([null, 10, 12, 12, 12, 10]);
  });

  it('maps a thumb finger character to "T"', () => {
    const shape = parseShape('E7.thumb', 'E7', '020100', 'T2-1--');

    expect(shape.notes[0]).toEqual({ fret: 0, finger: 'T' });
  });

  it('throws when the frets string does not describe six strings', () => {
    expect(() => parseShape('bad', 'C', 'x3201', '-32-1-')).toThrow(/6 strings/);
  });

  it('throws on an invalid fret character', () => {
    expect(() => parseShape('bad', 'C', 'x3201y', '-32-1-')).toThrow(/Invalid fret character/);
  });

  it('throws when the fingers string is not six characters', () => {
    expect(() => parseShape('bad', 'C', 'x32010', '-32-1')).toThrow(/6 finger characters/);
  });

  it('throws on an invalid finger character', () => {
    expect(() => parseShape('bad', 'C', 'x32010', '-32-5-')).toThrow(/Invalid finger character/);
  });

  it('throws on an unterminated fret group', () => {
    expect(() => parseShape('bad', 'C', 'x(10233', '-32-1-')).toThrow(/Unterminated fret group/);
  });
});
