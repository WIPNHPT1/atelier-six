import { chordName, romanToChord, type ChordQuality } from './theory/chord.ts';
import type { PitchClass } from './theory/pitch.ts';

export type ProgressionLike = { roman: string[] };

export type ResolveOptions = { power?: boolean };

export function resolveProgression(
  prog: ProgressionLike,
  keyPc: PitchClass,
  opts: ResolveOptions = {},
): string[] {
  return prog.roman.map((roman) => {
    const chord = romanToChord(roman, keyPc);
    const quality: ChordQuality = opts.power ? '5' : chord.quality;
    return chordName({ root: chord.root, quality });
  });
}
