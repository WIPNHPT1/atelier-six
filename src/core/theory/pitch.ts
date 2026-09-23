export type PitchClass = number;

const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

export function noteName(pc: PitchClass, preferFlats = false): string {
  const names = preferFlats ? FLAT_NAMES : SHARP_NAMES;
  return names[mod12(pc)] as string;
}

const NOTE_TO_PC: Record<string, PitchClass> = {
  C: 0,
  'B#': 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  F: 5,
  'E#': 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
  Cb: 11,
};

export function parseNote(note: string): PitchClass {
  const pc = NOTE_TO_PC[note.trim()];
  if (pc === undefined) {
    throw new Error(`Unknown note name: ${note}`);
  }
  return pc;
}

export function transpose(pc: PitchClass, semitones: number): PitchClass {
  return mod12(pc + semitones);
}

export function midiToFreq(midi: number, a4 = 440): number {
  return a4 * 2 ** ((midi - 69) / 12);
}

export function freqToMidi(freq: number, a4 = 440): number {
  return 69 + 12 * Math.log2(freq / a4);
}
