import { transpose } from './pitch.ts';
import { chordName, type ChordQuality } from './chord.ts';
import { parseChordName } from '../shapes/library.ts';

// With a capo on, the shape you fret still has its usual name, but it sounds higher:
// "G shape" with a capo on fret 2 sounds as A.
export function soundingChordName(shapeName: string, capo: number): string {
  if (capo <= 0) return shapeName;
  const { root, quality } = parseChordName(shapeName);
  return chordName({ root: transpose(root, capo), quality: quality as ChordQuality });
}
