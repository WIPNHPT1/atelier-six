import { exactMidi } from './exactMidi';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const SEMITONES_PER_OCTAVE = 12;
const CENTS_PER_SEMITONE = 100;

type NoteIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

// The modulo is always in [0, 11], but TS can't see that through arithmetic, so the tuple
// index is narrowed explicitly instead of adding an unreachable `?? fallback` branch.
function noteIndex(midi: number): NoteIndex {
  return (((midi % SEMITONES_PER_OCTAVE) + SEMITONES_PER_OCTAVE) %
    SEMITONES_PER_OCTAVE) as NoteIndex;
}

export interface Note {
  midi: number;
  name: string;
  octave: number;
  cents: number;
}

export function midiToNote(midi: number): { name: string; octave: number } {
  const name = NOTE_NAMES[noteIndex(midi)];
  const octave = Math.floor(midi / SEMITONES_PER_OCTAVE) - 1;
  return { name, octave };
}

export function freqToNote(freq: number, a4 = 440): Note {
  const exact = exactMidi(freq, a4);
  const midi = Math.round(exact);
  const cents = (exact - midi) * CENTS_PER_SEMITONE;
  return { midi, cents, ...midiToNote(midi) };
}
