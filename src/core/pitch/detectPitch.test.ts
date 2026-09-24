import { describe, expect, it } from 'vitest';
import { detectPitch } from './detectPitch';

const SAMPLE_RATE = 44100;
const BUFFER_SIZE = 2048;

function sineBuffer(freq: number, sampleRate = SAMPLE_RATE, length = BUFFER_SIZE): Float32Array {
  const buffer = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    buffer[i] = Math.sin((2 * Math.PI * freq * i) / sampleRate);
  }
  return buffer;
}

function sineWithHarmonicAndNoise(
  freq: number,
  sampleRate = SAMPLE_RATE,
  length = BUFFER_SIZE,
): Float32Array {
  const buffer = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const fundamental = Math.sin((2 * Math.PI * freq * i) / sampleRate);
    const harmonic = 0.3 * Math.sin((2 * Math.PI * freq * 2 * i) / sampleRate);
    const noise = 0.02 * (Math.random() * 2 - 1);
    buffer[i] = fundamental + harmonic + noise;
  }
  return buffer;
}

const STRING_FREQS = [82.41, 110, 146.83, 196, 246.94, 329.63, 73.42];

describe('detectPitch', () => {
  it.each(STRING_FREQS)('detects a pure sine at %f Hz within tolerance', (freq) => {
    const result = detectPitch(sineBuffer(freq), SAMPLE_RATE);
    expect(result).not.toBeNull();
    expect(result?.freq).toBeCloseTo(freq, 0);
  });

  it.each(STRING_FREQS)('detects a sine + 2nd harmonic + noise at %f Hz', (freq) => {
    const result = detectPitch(sineWithHarmonicAndNoise(freq), SAMPLE_RATE);
    expect(result).not.toBeNull();
    expect(result?.freq).toBeCloseTo(freq, 0);
  });

  it('returns null for silence', () => {
    const buffer = new Float32Array(BUFFER_SIZE);
    expect(detectPitch(buffer, SAMPLE_RATE)).toBeNull();
  });
});
