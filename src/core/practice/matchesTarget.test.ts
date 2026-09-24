import { describe, expect, it } from 'vitest';
import { matchesTarget } from './matchesTarget';

describe('matchesTarget', () => {
  it('matches an exact hit', () => {
    expect(matchesTarget(40, 40)).toBe(true);
  });

  it('matches within tolerance', () => {
    expect(matchesTarget(40.3, 40, 40)).toBe(true);
    expect(matchesTarget(39.7, 40, 40)).toBe(true);
  });

  it('rejects outside tolerance', () => {
    expect(matchesTarget(40.5, 40, 40)).toBe(false);
    expect(matchesTarget(39.5, 40, 40)).toBe(false);
  });

  it('respects a custom tolerance', () => {
    expect(matchesTarget(40.6, 40, 60)).toBe(true);
    expect(matchesTarget(40.6, 40, 50)).toBe(false);
  });

  it('matches the same pitch class an octave up or down when allowOctave is true', () => {
    expect(matchesTarget(52, 40)).toBe(true);
    expect(matchesTarget(28, 40)).toBe(true);
    expect(matchesTarget(64, 40)).toBe(true);
  });

  it('rejects a different octave when allowOctave is false', () => {
    expect(matchesTarget(52, 40, 40, false)).toBe(false);
    expect(matchesTarget(40, 40, 40, false)).toBe(true);
  });

  it('picks the shortest wrap distance near a tritone', () => {
    expect(matchesTarget(46, 40, 40, true)).toBe(false);
    expect(matchesTarget(46.4, 40, 40, true)).toBe(false);
  });
});
