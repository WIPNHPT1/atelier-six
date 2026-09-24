import { describe, expect, it } from 'vitest';
import { standard, dropD, halfDown } from '../tuning';
import { nearestString } from './nearestString';

const A4 = 440;

function freqForMidi(midi: number, centsOffset = 0): number {
  return A4 * Math.pow(2, (midi + centsOffset / 100 - 69) / 12);
}

describe('nearestString', () => {
  it('picks the closest open string in standard tuning', () => {
    const result = nearestString(freqForMidi(45, 10), standard);
    expect(result.string).toBe(1);
    expect(result.targetMidi).toBe(45);
    expect(result.cents).toBeCloseTo(10, 0);
  });

  it('picks the low D string in drop D tuning', () => {
    const result = nearestString(freqForMidi(38), dropD);
    expect(result.string).toBe(0);
    expect(result.targetMidi).toBe(38);
    expect(result.cents).toBeCloseTo(0, 0);
  });

  it('picks the correct string in half-step-down tuning', () => {
    const result = nearestString(freqForMidi(39, -30), halfDown);
    expect(result.string).toBe(0);
    expect(result.targetMidi).toBe(39);
    expect(result.cents).toBeCloseTo(-30, 0);
  });

  it('applies capo offset', () => {
    const result = nearestString(freqForMidi(47), standard, 2);
    expect(result.string).toBe(1);
    expect(result.targetMidi).toBe(47);
  });
});
