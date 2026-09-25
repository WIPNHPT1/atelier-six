import { describe, expect, it } from 'vitest';
import { computeStringPaths } from './computeStringPaths';

const GRID_SPAN = 100;
const PAD = 20;
const AMPLITUDE = 5;

describe('computeStringPaths', () => {
  it('returns one path per played string, spanning the string', () => {
    const strum = {
      strings: [
        { string: 0, midi: 40, offset: 0 },
        { string: 5, midi: 64, offset: 0 },
      ],
      palmMute: false,
      tSincePluck: 0.05,
    };
    const paths = computeStringPaths(strum, GRID_SPAN, PAD, AMPLITUDE);
    expect(paths).toHaveLength(2);
    expect(paths[0]?.stringIndex).toBe(0);
    expect(paths[0]?.points[0]?.x).toBe(PAD);
    expect(paths[0]?.points.at(-1)?.x).toBe(PAD + GRID_SPAN);
  });

  it('skips a string whose stagger offset has not been reached yet', () => {
    const strum = {
      strings: [{ string: 0, midi: 40, offset: 200 }],
      palmMute: false,
      tSincePluck: 0.05,
    };
    expect(computeStringPaths(strum, GRID_SPAN, PAD, AMPLITUDE)).toEqual([]);
  });

  it('stops drawing a string once it has decayed to silence', () => {
    const strum = {
      strings: [{ string: 0, midi: 40, offset: 0 }],
      palmMute: true,
      tSincePluck: 10,
    };
    expect(computeStringPaths(strum, GRID_SPAN, PAD, AMPLITUDE)).toEqual([]);
  });

  it('rings longer open than palm-muted', () => {
    const openStrum = {
      strings: [{ string: 0, midi: 40, offset: 0 }],
      palmMute: false,
      tSincePluck: 1,
    };
    const mutedStrum = { ...openStrum, palmMute: true };
    expect(computeStringPaths(openStrum, GRID_SPAN, PAD, AMPLITUDE)).toHaveLength(1);
    expect(computeStringPaths(mutedStrum, GRID_SPAN, PAD, AMPLITUDE)).toEqual([]);
  });

  it('displaces to zero at both ends of every path (standing wave nodes)', () => {
    const strum = {
      strings: [{ string: 2, midi: 50, offset: 0 }],
      palmMute: false,
      tSincePluck: 0.05,
    };
    const [path] = computeStringPaths(strum, GRID_SPAN, PAD, AMPLITUDE);
    expect(path?.points[0]?.y).toBeCloseTo(0);
    expect(path?.points.at(-1)?.y).toBeCloseTo(0);
  });
});
