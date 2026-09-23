import { describe, expect, it } from 'vitest';
import { RHYTHMS } from './rhythms.ts';

describe('RHYTHMS', () => {
  it('has steps sorted ascending and within the bar for every preset', () => {
    for (const rhythm of RHYTHMS) {
      const ts = rhythm.steps.map((step) => step.t);
      expect(ts).toEqual([...ts].sort((a, b) => a - b));
      for (const t of ts) {
        expect(t).toBeGreaterThanOrEqual(0);
        expect(t).toBeLessThan(rhythm.subdivision);
      }
    }
  });

  it('has unique ids', () => {
    const ids = RHYTHMS.map((rhythm) => rhythm.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('marks the sixteenth-motion ghost steps so the arm keeps moving', () => {
    const sixteenth = RHYTHMS.find((rhythm) => rhythm.id === 'sixteenth-motion');
    expect(sixteenth?.steps).toHaveLength(16);
    const sounding = sixteenth?.steps.filter((step) => step.ghost !== true).map((step) => step.t);
    expect(sounding).toEqual([0, 2, 3, 6, 8, 10, 11, 14]);
  });

  it('gives driving-eighths 8 palm-muted downstrokes', () => {
    const driving = RHYTHMS.find((rhythm) => rhythm.id === 'driving-eighths');
    expect(driving?.steps).toHaveLength(8);
    expect(driving?.steps.every((step) => step.dir === 'D' && step.palmMute === true)).toBe(true);
  });
});
