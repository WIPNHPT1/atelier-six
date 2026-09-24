import type { Tuning } from '../tuning';
import { openStringMidi } from '../tuning';

const SEMITONES_PER_OCTAVE = 12;
const CENTS_PER_SEMITONE = 100;
const MIDI_A4 = 69;
const A4_HZ = 440;

export interface NearestString {
  string: number;
  targetMidi: number;
  cents: number;
}

export function nearestString(freq: number, tuning: Tuning, capo = 0): NearestString {
  const exactMidi = MIDI_A4 + SEMITONES_PER_OCTAVE * Math.log2(freq / A4_HZ);
  const openMidis = openStringMidi(tuning, capo);

  let closestIndex = 0;
  let closestDiff = Infinity;
  openMidis.forEach((targetMidi, index) => {
    const diff = Math.abs(exactMidi - targetMidi);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestIndex = index;
    }
  });

  const targetMidi = openMidis[closestIndex] ?? 0;
  const cents = (exactMidi - targetMidi) * CENTS_PER_SEMITONE;
  return { string: closestIndex, targetMidi, cents };
}
