import { chordName } from '../theory/chord.ts';
import { dropD } from '../tuning.ts';
import type { PitchClass } from '../theory/pitch.ts';
import type { Shape, StringNote } from './types.ts';

const OPEN_LOW_STRING_PC: PitchClass = dropD[0] % 12;
const MUTED: StringNote = { fret: null, finger: null };

function fretFor(root: PitchClass): number {
  return ((root - OPEN_LOW_STRING_PC) % 12 + 12) % 12;
}

// In Drop D the three lowest strings (D-A-D) are a fifth apart, so barring them at any
// fret gives a root-fifth-octave power chord with a single finger.
export function dropDPower(root: PitchClass): Shape {
  const fret = fretFor(root);
  const fretted: StringNote = fret === 0 ? { fret: 0, finger: null } : { fret, finger: 1 };
  const chord = chordName({ root, quality: '5' });
  return {
    id: `${chord.toLowerCase()}-dropd-power`,
    chord,
    notes: [{ ...fretted }, { ...fretted }, { ...fretted }, MUTED, MUTED, MUTED],
    register: 'low',
    tags: ['power', 'dropD'],
    ...(fret > 0 ? { barre: { fret, from: 0, to: 2, finger: 1 as const } } : {}),
  };
}
