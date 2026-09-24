import { describe, expect, it } from 'vitest';
import { stepDurSeconds } from '../schedule/buildSchedule.ts';
import { buildBand, humaniseBand, type BandBar, type BandEvent } from './band.ts';

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
    [0, 6, 8, 14].forEach((s, i) => {
      expect(Math.abs((kicks[i] ?? 0) - s * step)).toBeLessThanOrEqual(0.005);
    });
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

describe('band feel', () => {
  it('plays a snare fill into the next section, but not into a breakdown', () => {
    const into = buildBand('power', [bar(), bar({ firstOfSection: true })], 120);
    const step = stepDurSeconds(120);
    const lastBeatSnares = into.filter(
      (e) => e.part === 'drums' && e.drum === 'snare' && e.t > 11.5 * step && e.t < 16 * step,
    );
    expect(lastBeatSnares).toHaveLength(4);
    const intoStop = buildBand(
      'power',
      [bar(), bar({ firstOfSection: true, section: 'breakdown' })],
      120,
    );
    const stopSnares = intoStop.filter(
      (e) => e.part === 'drums' && e.drum === 'snare' && e.t > 11.5 * step,
    );
    expect(stopSnares).toHaveLength(1);
  });

  it('accents hi-hats on the beat and varies every hit a little', () => {
    const events = buildBand('open', [bar({ dynamics: 1 })], 90);
    const hats = events.flatMap((e) => (e.part === 'drums' && e.drum === 'hihatClosed' ? [e] : []));
    expect(new Set(hats.map((e) => e.velocity.toFixed(3))).size).toBeGreaterThan(8);
    expect(hats.some((e) => e.detune !== 0)).toBe(true);
    expect(hats.every((e) => Math.abs(e.detune) <= 12)).toBe(true);
  });

  it('humanises deterministically and never before zero', () => {
    const raw: BandEvent[] = [
      { t: 0, part: 'drums', drum: 'kick', velocity: 0.8, detune: 0 },
      { t: 0, part: 'drums', drum: 'hihatOpen', velocity: 0.5, detune: 0 },
      { t: 0.5, part: 'bass', midi: 40, duration: 0.2, velocity: 0.8 },
      { t: 1, part: 'pad', midis: [60, 64, 67], duration: 2, velocity: 0.4 },
    ];
    const a = humaniseBand(raw, 3);
    expect(a).toEqual(humaniseBand(raw, 3));
    expect(a.every((e) => e.t >= 0)).toBe(true);
    expect(a[2]?.t).toBeGreaterThan(0.5 - 0.008 + 0.004);
  });
});
