const CENTS_PER_SEMITONE = 100;
const SEMITONES_PER_OCTAVE = 12;

// Wraps a semitone difference into (-6, 6], the shortest distance to the target pitch class.
function octaveWrap(diffSemitones: number): number {
  const wrapped =
    ((diffSemitones % SEMITONES_PER_OCTAVE) + SEMITONES_PER_OCTAVE * 1.5) % SEMITONES_PER_OCTAVE;
  return wrapped - SEMITONES_PER_OCTAVE / 2;
}

export function matchesTarget(
  detectedMidi: number,
  targetMidi: number,
  toleranceCents = 40,
  allowOctave = true,
): boolean {
  const diffSemitones = detectedMidi - targetMidi;
  const shortest = allowOctave ? octaveWrap(diffSemitones) : diffSemitones;
  // Rounded to avoid floating-point noise pushing an exact-tolerance case over the edge.
  const cents = Math.round(Math.abs(shortest) * CENTS_PER_SEMITONE * 1000) / 1000;
  return cents <= toleranceCents;
}
