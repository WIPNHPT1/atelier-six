import { describe, expect, it } from 'vitest';
import { getChord, getShapes } from './library.ts';
import { validateShape } from './validateShape.ts';
import chordsData from '../../data/chords.json';
import type { Shape } from './types.ts';

const DATA = chordsData as unknown as Record<string, Shape[]>;

describe('chord data', () => {
  it('produces only valid shapes', () => {
    for (const [name, shapes] of Object.entries(DATA)) {
      for (const shape of shapes) {
        expect(validateShape(shape), `${name} / ${shape.id}`).toEqual([]);
      }
    }
  });
});

describe('getChord', () => {
  it('returns undefined for an unknown chord', () => {
    expect(getChord('Nope')).toBeUndefined();
  });

  it('returns the chord name and its shapes', () => {
    const chord = getChord('C');
    expect(chord?.name).toBe('C');
    expect(chord?.shapes.length).toBeGreaterThan(0);
  });

  it('parses a single-letter root with no suffix as major', () => {
    expect(getChord('F')).toMatchObject({ root: 5, quality: 'maj' });
  });

  it('parses a sharp root name', () => {
    expect(getChord('C#')).toMatchObject({ root: 1, quality: 'maj' });
  });

  it('parses an "m" suffix as minor', () => {
    expect(getChord('Am')).toMatchObject({ root: 9, quality: 'min' });
  });

  it('keeps any other suffix as the literal quality', () => {
    expect(getChord('G5')).toMatchObject({ root: 7, quality: '5' });
    expect(getChord('Cadd9')).toMatchObject({ root: 0, quality: 'add9' });
  });
});

describe('getShapes', () => {
  it('has the C open shape', () => {
    expect(getShapes('C').some((shape) => shape.id === 'C.open.a')).toBe(true);
  });

  it('has 3 G shape variants: open.a, open.b and anchored', () => {
    const ids = getShapes('G').map((shape) => shape.id);
    expect(ids).toEqual(expect.arrayContaining(['G.open.a', 'G.open.b', 'G.anchored']));
  });

  it('has 2 Em open shapes', () => {
    const ids = getShapes('Em', { tags: ['open'] }).map((shape) => shape.id);
    expect(ids).toEqual(expect.arrayContaining(['Em.open.a', 'Em.open.b']));
  });

  it('has all 5 anchored shapes', () => {
    const anchored = [
      ...getShapes('Em7', { tags: ['anchored'] }),
      ...getShapes('G', { tags: ['anchored'] }),
      ...getShapes('Dsus4', { tags: ['anchored'] }),
      ...getShapes('A7sus4', { tags: ['anchored'] }),
      ...getShapes('Cadd9', { tags: ['anchored'] }),
    ];
    expect(anchored).toHaveLength(5);
  });

  it('gives G5 at least 3 power shapes', () => {
    expect(getShapes('G5', { tags: ['power'] }).length).toBeGreaterThanOrEqual(3);
  });

  it('gives F an E-shape barre at fret 1', () => {
    const barre = getShapes('F', { tags: ['barre'] }).find((shape) => shape.id === 'F.barre.e');
    expect(barre?.barre).toEqual({ fret: 1, from: 0, to: 5, finger: 1 });
  });

  it('gives Bm an A-shape minor barre at fret 2', () => {
    const barre = getShapes('Bm', { tags: ['barre'] }).find((shape) => shape.id === 'Bm.barre.a');
    expect(barre?.barre).toEqual({ fret: 2, from: 1, to: 5, finger: 1 });
  });

  it('filters by register', () => {
    const highOnly = getShapes('C#', { register: 'high' });
    expect(highOnly.length).toBeGreaterThan(0);
    expect(highOnly.every((shape) => shape.register === 'high')).toBe(true);
    expect(getShapes('C#', { register: 'low' })).toHaveLength(0);
  });

  it('returns an empty list for an unknown chord', () => {
    expect(getShapes('Nope')).toEqual([]);
  });
});
