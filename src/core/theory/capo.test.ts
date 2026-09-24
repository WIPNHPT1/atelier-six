import { describe, expect, it } from 'vitest';
import { soundingChordName } from './capo';

describe('soundingChordName', () => {
  it('returns the shape name unchanged with no capo', () => {
    expect(soundingChordName('G', 0)).toBe('G');
  });

  it('transposes a major shape up by the capo', () => {
    expect(soundingChordName('G', 2)).toBe('A');
  });

  it('keeps the quality suffix', () => {
    expect(soundingChordName('Am', 2)).toBe('Bm');
    expect(soundingChordName('D5', 3)).toBe('F5');
  });

  it('wraps around the octave', () => {
    expect(soundingChordName('B', 3)).toBe('D');
  });
});
