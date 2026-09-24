import { describe, expect, it } from 'vitest';
import { resumePosition } from './tempoChange.ts';

describe('resumePosition', () => {
  it('keeps the same beat when the tempo changes', () => {
    // 3 s at 120 bpm is beat 6; at 60 bpm beat 6 is at 6 s.
    expect(resumePosition(3, 120, 60, null)).toBeCloseTo(6);
    expect(resumePosition(3, 120, 240, null)).toBeCloseTo(1.5);
  });

  it('counts from the start of the current pass when looping', () => {
    // An 8 s loop at 120 bpm: 11 s in is 3 s into the second pass.
    expect(resumePosition(11, 120, 60, 8)).toBeCloseTo(6);
    expect(resumePosition(11, 120, 60, 0)).toBeCloseTo(22);
  });

  it('never goes before the start', () => {
    expect(resumePosition(-1, 120, 60, null)).toBe(0);
  });
});
