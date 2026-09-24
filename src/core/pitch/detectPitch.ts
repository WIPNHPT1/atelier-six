import { PitchDetector } from 'pitchy';

const CLARITY_THRESHOLD = 0.9;
// A real acoustic guitar through a phone/laptop mic with autoGainControl off (required for
// accurate pitch reading) is much quieter than a synthesized test tone — real playing measured
// as low as 0.002 rms with clarity 0.99, so the gate only needs to catch near-total silence.
const RMS_NOISE_GATE = 0.0008;
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

export interface RawPitch {
  freq: number;
  clarity: number;
  rms: number;
}

// The ungated read: useful to see why a real frame is being rejected (a calm on-screen
// readout beats asking a non-technical user to open a browser console).
export function detectPitchRaw(buffer: Float32Array, sampleRate: number): RawPitch {
  const level = rms(buffer);
  const detector = detectorFor(buffer.length);
  const [freq, clarity] = detector.findPitch(buffer, sampleRate);
  return { freq, clarity, rms: level };
}

export function detectPitch(buffer: Float32Array, sampleRate: number): PitchResult | null {
  const raw = detectPitchRaw(buffer, sampleRate);
  if (raw.rms < RMS_NOISE_GATE) return null;
  if (raw.clarity < CLARITY_THRESHOLD) return null;
  if (raw.freq < MIN_FREQ_HZ || raw.freq > MAX_FREQ_HZ) return null;
  return { freq: raw.freq, clarity: raw.clarity };
}
