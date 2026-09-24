import { describe, expect, it } from 'vitest';
import { exactMidi } from './exactMidi';

describe('exactMidi', () => {
  it('resolves A4 to midi 69', () => {
    expect(exactMidi(440)).toBeCloseTo(69, 6);
  });

  it('resolves a fractional midi between semitones', () => {
    const halfway = 440 * Math.pow(2, 0.5 / 12);
    expect(exactMidi(halfway)).toBeCloseTo(69.5, 6);
  });

  it('respects a custom A4 calibration', () => {
    expect(exactMidi(432, 432)).toBeCloseTo(69, 6);
  });
});
