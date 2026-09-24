const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SEMITONES_PER_OCTAVE = 12;
const CENTS_PER_SEMITONE = 100;
const MIDI_A4 = 69;

export interface Note {
  midi: number;
  name: string;
  octave: number;
  cents: number;
}

export function freqToNote(freq: number, a4 = 440): Note {
  const exactMidi = MIDI_A4 + SEMITONES_PER_OCTAVE * Math.log2(freq / a4);
  const midi = Math.round(exactMidi);
  const cents = (exactMidi - midi) * CENTS_PER_SEMITONE;
  const name =
    NOTE_NAMES[((midi % SEMITONES_PER_OCTAVE) + SEMITONES_PER_OCTAVE) % SEMITONES_PER_OCTAVE] ??
    'C';
  const octave = Math.floor(midi / SEMITONES_PER_OCTAVE) - 1;
  return { midi, name, octave, cents };
}
