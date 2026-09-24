import { PitchDetector } from 'pitchy';

const CLARITY_THRESHOLD = 0.9;
const RMS_NOISE_GATE = 0.01;
// Guides the autocorrelation away from spurious near-DC "pitches" it can lock onto on
// decaying/non-periodic noise; comfortably covers a guitar from low D to a capo'd high e.
const MIN_FREQ_HZ = 55;
const MAX_FREQ_HZ = 1500;

const detectors = new Map<number, PitchDetector<Float32Array>>();

function detectorFor(length: number): PitchDetector<Float32Array> {
  const existing = detectors.get(length);
  if (existing) return existing;
  const detector = PitchDetector.forFloat32Array(length);
  detectors.set(length, detector);
  return detector;
}

function rms(buffer: Float32Array): number {
  let sumSquares = 0;
  for (const sample of buffer) sumSquares += sample * sample;
  return Math.sqrt(sumSquares / buffer.length);
}

export interface PitchResult {
  freq: number;
  clarity: number;
}

export function detectPitch(buffer: Float32Array, sampleRate: number): PitchResult | null {
  if (rms(buffer) < RMS_NOISE_GATE) return null;

  const detector = detectorFor(buffer.length);
  const [freq, clarity] = detector.findPitch(buffer, sampleRate);

  if (clarity < CLARITY_THRESHOLD) return null;
  if (freq < MIN_FREQ_HZ || freq > MAX_FREQ_HZ) return null;
  return { freq, clarity };
}
