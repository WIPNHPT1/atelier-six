import { describe, expect, it } from 'vitest';
import { decayTau, stringDisplacement, visualFrequency } from './stringMotion';

describe('visualFrequency', () => {
  it('is slower for a lower pitch and faster for a higher one', () => {
    expect(visualFrequency(40)).toBeLessThan(visualFrequency(64));
  });

  it('clamps outside the instrument range', () => {
    expect(visualFrequency(-10)).toBe(visualFrequency(38));
    expect(visualFrequency(200)).toBe(visualFrequency(88));
  });
});

describe('decayTau', () => {
  it('is short when palm-muted and long when open', () => {
    expect(decayTau(true)).toBeLessThan(decayTau(false));
  });
});

describe('stringDisplacement', () => {
  const params = { amplitude: 1, freqHz: 4, tau: 1, length: 10 };

  it('is silent before the pluck', () => {
    expect(stringDisplacement(params, -0.1, 5)).toBe(0);
  });

  it('is zero at both ends of the string (standing wave nodes)', () => {
    expect(stringDisplacement(params, 0.1, 0)).toBeCloseTo(0);
    expect(stringDisplacement(params, 0.1, 10)).toBeCloseTo(0);
  });

  it('peaks at the string midpoint at the moment of the pluck', () => {
    // sin(2π·4·0) = 0, so use a t where the oscillation term is at its peak.
    const t = 1 / (4 * 4); // quarter period → sin term = 1
    const value = stringDisplacement(params, t, 5);
    expect(value).toBeCloseTo(Math.exp(-t / 1), 5);
  });

  it('decays over time', () => {
    // Both land at the same oscillation phase (a quarter period apart from a full cycle),
    // so only the exponential envelope differs.
    const quarterPeriod = 1 / (4 * params.freqHz);
    const period = 1 / params.freqHz;
    const early = Math.abs(stringDisplacement(params, quarterPeriod, 5));
    const late = Math.abs(stringDisplacement(params, quarterPeriod + period, 5));
    expect(late).toBeLessThan(early);
  });

  it('scales with amplitude', () => {
    const base = stringDisplacement(params, 1 / 16, 5);
    const doubled = stringDisplacement({ ...params, amplitude: 2 }, 1 / 16, 5);
    expect(doubled).toBeCloseTo(base * 2, 5);
  });
});
