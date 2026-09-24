import { describe, expect, it } from 'vitest';
import { stepDurSeconds } from '../schedule/buildSchedule.ts';
import { buildBand, type BandBar } from './band.ts';

const E5 = { root: 4, quality: '5' as const };
const G = { root: 7, quality: 'maj' as const };
const bar = (extra: Partial<BandBar> = {}): BandBar => ({
  chord: E5,
  section: 'verse',
  dynamics: 0.7,
  hits: [0, 2, 4, 6, 8, 10, 12, 14],
  firstOfSection: false,
  ...extra,
});

describe('buildBand', () => {
  it('plays a pop-punk beat with eighth-note bass on the root', () => {
    const events = buildBand('power', [bar({ firstOfSection: true })], 120);
    const drums = events.flatMap((e) => (e.part === 'drums' ? [e.drum] : []));
    expect(drums.filter((d) => d === 'snare')).toHaveLength(2);
    expect(drums.filter((d) => d === 'crash')).toHaveLength(1);
    const bass = events.flatMap((e) => (e.part === 'bass' ? [e.midi] : []));
    expect(bass).toEqual(Array<number>(8).fill(40));
    expect(events.some((e) => e.part === 'pad')).toBe(false);
  });

  it('opens the hats in loud sections and follows the hits in a breakdown', () => {
    const loud = buildBand('power', [bar({ dynamics: 1 })], 120);
    expect(loud.some((e) => e.part === 'drums' && e.drum === 'hihatOpen')).toBe(true);
    const stop = buildBand('power', [bar({ section: 'breakdown', hits: [0, 6, 8, 14] })], 120);
    const kicks = stop.filter((e) => e.part === 'drums' && e.drum === 'kick').map((e) => e.t);
    const step = stepDurSeconds(120);
    expect(kicks).toEqual([0, 6, 8, 14].map((s) => s * step));
    expect(stop.some((e) => e.part === 'drums' && e.drum === 'snare')).toBe(false);
  });

  it('adds a soft pad for Britpop and moves later bars along', () => {
    const events = buildBand('open', [bar({ chord: G }), bar({ chord: G, dynamics: 1 })], 90);
    const pads = events.filter((e) => e.part === 'pad');
    expect(pads).toHaveLength(2);
    expect(pads[1]?.t).toBeCloseTo(16 * stepDurSeconds(90));
    expect(
      pads[0]?.part === 'pad' && pads[0].midis.map((m) => m % 12).sort((a, b) => a - b),
    ).toEqual([2, 7, 11]);
    expect(events.map((e) => e.t)).toEqual([...events.map((e) => e.t)].sort((a, b) => a - b));
  });
});
