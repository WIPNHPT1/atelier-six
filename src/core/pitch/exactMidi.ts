const SEMITONES_PER_OCTAVE = 12;
const MIDI_A4 = 69;

// A continuous (fractional) MIDI note number, unlike freqToNote's rounded `midi` + `cents` pair.
export function exactMidi(freq: number, a4 = 440): number {
  return MIDI_A4 + SEMITONES_PER_OCTAVE * Math.log2(freq / a4);
}
