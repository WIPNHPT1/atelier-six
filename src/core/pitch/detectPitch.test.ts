import { describe, expect, it } from 'vitest';
import { detectPitch, detectPitchRaw } from './detectPitch';

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

  it('returns null for loud noise with no clear pitch', () => {
    const buffer = new Float32Array(BUFFER_SIZE);
    for (let i = 0; i < buffer.length; i++) buffer[i] = Math.random() * 2 - 1;
    expect(detectPitch(buffer, SAMPLE_RATE)).toBeNull();
  });

  it('rejects a clean tone above the plausible instrument range', () => {
    const result = detectPitch(sineBuffer(2000), SAMPLE_RATE);
    expect(result).toBeNull();
  });

  it('rejects a clean tone below the plausible instrument range', () => {
    // A long buffer so a 30 Hz tone still has enough periods for a confident autocorrelation.
    const result = detectPitch(sineBuffer(30, SAMPLE_RATE, BUFFER_SIZE * 8), SAMPLE_RATE);
    expect(result).toBeNull();
  });
});

describe('detectPitchRaw', () => {
  it('reports freq, clarity and rms without gating', () => {
    const raw = detectPitchRaw(sineBuffer(110), SAMPLE_RATE);
    expect(raw.freq).toBeCloseTo(110, 0);
    expect(raw.clarity).toBeGreaterThan(0.9);
    expect(raw.rms).toBeGreaterThan(0);
  });

  it('still reports a reading for silence, unlike detectPitch', () => {
    const raw = detectPitchRaw(new Float32Array(BUFFER_SIZE), SAMPLE_RATE);
    expect(raw.rms).toBe(0);
  });
});
