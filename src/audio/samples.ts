// Sample sources — see docs/licences.md for provenance and licences.
// Every 3rd semitone (a minor third), Tone.Sampler pitch-shifts the gaps.

export const GUITAR_SAMPLE_FILES: Record<string, string> = {
  E2: 'E2.mp3',
  C3: 'C3.mp3',
  'D#3': 'Ds3.mp3',
  'F#3': 'Fs3.mp3',
  A3: 'A3.mp3',
  C4: 'C4.mp3',
  'D#4': 'Ds4.mp3',
  'F#4': 'Fs4.mp3',
  A4: 'A4.mp3',
  C5: 'C5.mp3',
};

export const BASS_SAMPLE_FILES: Record<string, string> = {
  E1: 'E1.mp3',
  G1: 'G1.mp3',
  'A#1': 'As1.mp3',
  'C#2': 'Cs2.mp3',
  E2: 'E2.mp3',
  G2: 'G2.mp3',
  'A#2': 'As2.mp3',
};

export const GUITAR_BASE_URL = '/audio/guitar-electric/';
export const BASS_BASE_URL = '/audio/bass-electric/';
export const CABINET_IR_URL = '/audio/cabinet-ir.wav';

export const DRUM_URLS = {
  kick: '/audio/drums/kick.wav',
  snare: '/audio/drums/snare.wav',
  hihatClosed: '/audio/drums/hihat-closed.wav',
  hihatOpen: '/audio/drums/hihat-open.wav',
  crash: '/audio/drums/crash.wav',
} as const;

export type DrumName = keyof typeof DRUM_URLS;

// General MIDI drum notes, so the kit can be a velocity-sensitive Tone.Sampler.
export const DRUM_NOTES: Record<DrumName, string> = {
  kick: 'C1',
  snare: 'D1',
  hihatClosed: 'F#1',
  hihatOpen: 'A#1',
  crash: 'C#2',
};

export function allSampleUrls(): string[] {
  const guitar = Object.values(GUITAR_SAMPLE_FILES).map((f) => GUITAR_BASE_URL + f);
  const bass = Object.values(BASS_SAMPLE_FILES).map((f) => BASS_BASE_URL + f);
  const drums = Object.values(DRUM_URLS);
  return [...guitar, ...bass, ...drums, CABINET_IR_URL];
}
