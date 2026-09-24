import type { Tuning } from '../tuning';
import { openStringMidi } from '../tuning';
import { exactMidi } from './exactMidi';

const CENTS_PER_SEMITONE = 100;

export interface NearestString {
  string: number;
  targetMidi: number;
  cents: number;
}

type StringIndex = 0 | 1 | 2 | 3 | 4 | 5;

export function nearestString(freq: number, tuning: Tuning, capo = 0): NearestString {
  const exact = exactMidi(freq);
  const openMidis = openStringMidi(tuning, capo);

  // Six strings, so the running index is narrowed to StringIndex: the tuple lookup below
  // never needs an unreachable `?? fallback` branch.
  let closestIndex: StringIndex = 0;
  let closestDiff = Infinity;
  openMidis.forEach((targetMidi, index) => {
    const diff = Math.abs(exact - targetMidi);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestIndex = index as StringIndex;
    }
  });

  const targetMidi = openMidis[closestIndex];
  const cents = (exact - targetMidi) * CENTS_PER_SEMITONE;
  return { string: closestIndex, targetMidi, cents };
}
