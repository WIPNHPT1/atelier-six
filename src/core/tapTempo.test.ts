import { describe, expect, it } from 'vitest';
import { tapTempo } from './tapTempo.ts';

describe('tapTempo', () => {
  it('returns null with fewer than two taps', () => {
    expect(tapTempo([])).toBeNull();
    expect(tapTempo([1000])).toBeNull();
  });

  it('averages evenly spaced taps into a bpm', () => {
    // 500ms between taps = 120 bpm.
    expect(tapTempo([0, 500, 1000, 1500])).toBeCloseTo(120, 9);
  });

  it('only uses the last 4 taps', () => {
    // A slow first gap (1000ms) is outside the 4-tap window and should be ignored.
    const timestamps = [0, 1000, 1500, 2000, 2500];
    expect(tapTempo(timestamps)).toBeCloseTo(120, 9);
  });

  it('averages uneven gaps', () => {
    // Gaps of 400ms and 600ms average to 500ms => 120 bpm.
    expect(tapTempo([0, 400, 1000])).toBeCloseTo(120, 9);
  });
});
