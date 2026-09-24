import chordsData from '../../data/chords.json';
import { parseNote, type PitchClass } from '../theory/pitch.ts';
import type { Chord, Shape } from './types.ts';

const DATA = chordsData as unknown as Record<string, Shape[]>;

function parseChordName(name: string): { root: PitchClass; quality: string } {
  const twoChar = name.slice(0, 2);
  const rootStr = twoChar.length === 2 && twoChar[1] === '#' ? twoChar : name.slice(0, 1);
  const root = parseNote(rootStr);
  const suffix = name.slice(rootStr.length);
  const quality = suffix === '' ? 'maj' : suffix === 'm' ? 'min' : suffix;
  return { root, quality };
}

export function getChord(name: string): Chord | undefined {
  const shapes = DATA[name];
  if (!shapes) return undefined;
  const { root, quality } = parseChordName(name);
  return { name, root, quality, shapes };
}

export type ShapeFilter = {
  tags?: string[];
  register?: Shape['register'];
};

export function getShapes(name: string, filter: ShapeFilter = {}): Shape[] {
  const shapes = DATA[name] ?? [];
  return shapes.filter((shape) => {
    if (filter.register !== undefined && shape.register !== filter.register) return false;
    if (filter.tags !== undefined && !filter.tags.every((tag) => shape.tags.includes(tag))) {
      return false;
    }
    return true;
  });
}

export function listChordNames(filter: ShapeFilter = {}): string[] {
  return Object.keys(DATA).filter((name) => getShapes(name, filter).length > 0);
}
