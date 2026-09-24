import type { Shape } from '../shapes/types';
import type { Tuning } from '../tuning';

const SEMITONES_PER_OCTAVE = 12;

type StringIndex = 0 | 1 | 2 | 3 | 4 | 5;

function stringMidi(tuning: Tuning, index: StringIndex, fret: number, capo: number): number {
  return tuning[index] + fret + capo;
}

// The lowest string sounding the chord's root pitch class — its octave is what a player
// naturally hears and plays first when landing a shape, so it's the auto-advance target.
export function lowestRootMidi(
  shape: Shape,
  rootPitchClass: number,
  tuning: Tuning,
  capo: number,
): number | null {
  let fallback: number | null = null;
  for (let i = 0; i < shape.notes.length; i++) {
    const index = i as StringIndex;
    const note = shape.notes[index];
    if (note.fret === null) continue;
    const midi = stringMidi(tuning, index, note.fret, capo);
    fallback ??= midi;
    if (
      ((midi % SEMITONES_PER_OCTAVE) + SEMITONES_PER_OCTAVE) % SEMITONES_PER_OCTAVE ===
      rootPitchClass
    ) {
      return midi;
    }
  }
  return fallback;
}
