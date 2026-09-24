import { describe, expect, it } from 'vitest';
import type { RhythmPreset } from '../../data/rhythms.ts';
import type { Shape } from '../shapes/types.ts';
import { standard } from '../tuning.ts';
import { buildSchedule, secondsToStep } from './buildSchedule.ts';

// Open-ish shape: low E muted, A=3, D=2, G=0, B=1, high e=0.
const shape: Shape = {
  id: 'test-shape',
  chord: 'C',
  notes: [
    { fret: null, finger: null },
    { fret: 3, finger: 3 },
    { fret: 2, finger: 2 },
    { fret: 0, finger: null },
    { fret: 1, finger: 1 },
    { fret: 0, finger: null },
  ],
  register: 'mid',
  tags: [],
};

const otherShape: Shape = { ...shape, id: 'other-shape', chord: 'G' };

const oneStepPerBar: RhythmPreset = {
  id: 'one-step',
  subdivision: 8,
  steps: [{ t: 0, dir: 'D' }],
};

describe('buildSchedule', () => {
  it('plays the next chord from the "and" of beat 4 when anticipating', () => {
    const eighths: RhythmPreset = {
      id: 'eighths',
      subdivision: 8,
      steps: Array.from({ length: 8 }, (_, t) => ({ t, dir: 'D' as const })),
    };
    const events = buildSchedule({
      shapes: [shape, otherShape],
      rhythm: eighths,
      bpm: 120,
      bars: [2, 2],
      tuning: standard,
      anticipate: 2,
    });
    const chordAt = (step: number) => events.find((event) => event.step === step)?.chordIndex;
    expect(chordAt(12)).toBe(0);
    expect(chordAt(28)).toBe(0);
    expect(chordAt(30)).toBe(1);
    expect(chordAt(62)).toBe(0);
  });

  it('produces one content event per rhythm step per bar', () => {
    const events = buildSchedule({
      shapes: [shape, otherShape],
      rhythm: oneStepPerBar,
      bpm: 120,
      bars: [2, 1],
      tuning: standard,
    });
    expect(events).toHaveLength(3);
    expect(events.every((e) => e.kind === 'strum')).toBe(true);
  });

  it('adds a click event on every beat of every bar when click is on', () => {
    const events = buildSchedule({
      shapes: [shape],
      rhythm: oneStepPerBar,
      bpm: 120,
      bars: [2],
      tuning: standard,
      click: true,
    });
    // 2 bars * (1 strum + 4 clicks) = 10
    expect(events).toHaveLength(10);
    expect(events.filter((e) => e.kind === 'click')).toHaveLength(8);
  });

  it('a chord with no entry in bars contributes zero bars', () => {
    const events = buildSchedule({
      shapes: [shape, otherShape],
      rhythm: oneStepPerBar,
      bpm: 120,
      bars: [1],
      tuning: standard,
    });
    expect(events).toHaveLength(1);
    expect(events[0]?.chordIndex).toBe(0);
  });

  it('orders strum offsets low-to-high for a down-strum', () => {
    const rhythm: RhythmPreset = { id: 'd', subdivision: 8, steps: [{ t: 0, dir: 'D' }] };
    const events = buildSchedule({
      shapes: [shape],
      rhythm,
      bpm: 120,
      bars: [1],
      tuning: standard,
    });
    const strings = events[0]?.strings ?? [];
    // Muted low E is excluded; remaining sounding strings low->high are 5,4,3,2,1.
    expect(strings.map((s) => s.string)).toEqual([5, 4, 3, 2, 1]);
    expect(strings.map((s) => s.offset)).toEqual([0, 0.012, 0.024, 0.036, 0.048]);
  });

  it('orders strum offsets high-to-low for an up-strum', () => {
    const rhythm: RhythmPreset = { id: 'u', subdivision: 8, steps: [{ t: 0, dir: 'U' }] };
    const events = buildSchedule({
      shapes: [shape],
      rhythm,
      bpm: 120,
      bars: [1],
      tuning: standard,
    });
    const strings = events[0]?.strings ?? [];
    // An upstroke mostly catches the thinner strings: the top four, high to low.
    expect(strings.map((s) => s.string)).toEqual([1, 2, 3, 4]);
    [1, 0.94, 0.88, 0.82].forEach((gain, i) => {
      expect(strings[i]?.gain).toBeCloseTo(gain);
    });
  });

  it('plays every named string on an upstroke that picks its strings', () => {
    const rhythm: RhythmPreset = {
      id: 'u',
      subdivision: 8,
      steps: [{ t: 0, dir: 'U', strings: [1, 2, 3, 4, 5] }],
    };
    const events = buildSchedule({
      shapes: [shape],
      rhythm,
      bpm: 120,
      bars: [1],
      tuning: standard,
    });
    expect(events[0]?.strings.map((s) => s.string)).toEqual([1, 2, 3, 4, 5]);
  });

  it('excludes a muted (fret null) string even when it is sounded by others', () => {
    const rhythm: RhythmPreset = { id: 'd', subdivision: 8, steps: [{ t: 0, dir: 'D' }] };
    const events = buildSchedule({
      shapes: [shape],
      rhythm,
      bpm: 120,
      bars: [1],
      tuning: standard,
    });
    const strings = events[0]?.strings ?? [];
    expect(strings.some((s) => s.string === 6)).toBe(false);
  });

  it('restricts strings to the step-specified set', () => {
    const rhythm: RhythmPreset = {
      id: 'p',
      subdivision: 8,
      steps: [{ t: 0, dir: 'pick', strings: [4] }],
    };
    const events = buildSchedule({
      shapes: [shape],
      rhythm,
      bpm: 120,
      bars: [1],
      tuning: standard,
    });
    const strings = events[0]?.strings ?? [];
    expect(strings.map((s) => s.string)).toEqual([4]);
    expect(events[0]?.kind).toBe('pick');
  });

  it('passes the palm-mute flag through, true and false', () => {
    const rhythm: RhythmPreset = {
      id: 'pm',
      subdivision: 8,
      steps: [
        { t: 0, dir: 'D', palmMute: true },
        { t: 4, dir: 'D' },
      ],
    };
    const events = buildSchedule({
      shapes: [shape],
      rhythm,
      bpm: 120,
      bars: [1],
      tuning: standard,
    });
    expect(events[0]?.palmMute).toBe(true);
    expect(events[1]?.palmMute).toBe(false);
  });

  it('gives a ghost step no sounding strings and kind ghost', () => {
    const rhythm: RhythmPreset = {
      id: 'g',
      subdivision: 8,
      steps: [{ t: 0, dir: 'D', ghost: true }],
    };
    const events = buildSchedule({
      shapes: [shape],
      rhythm,
      bpm: 120,
      bars: [1],
      tuning: standard,
    });
    expect(events[0]?.kind).toBe('ghost');
    expect(events[0]?.strings).toEqual([]);
  });

  it('boosts velocity on an accented step', () => {
    const rhythm: RhythmPreset = {
      id: 'a',
      subdivision: 8,
      steps: [
        { t: 0, dir: 'D', accent: true },
        { t: 4, dir: 'D' },
      ],
    };
    const events = buildSchedule({
      shapes: [shape],
      rhythm,
      bpm: 120,
      bars: [1],
      tuning: standard,
    });
    const accented = events[0]?.velocity ?? 0;
    const plain = events[1]?.velocity ?? 0;
    expect(accented).toBeGreaterThan(plain);
  });

  it('applies section dynamics: verse quieter than chorus, both quieter than un-set', () => {
    const rhythm: RhythmPreset = { id: 's', subdivision: 8, steps: [{ t: 0, dir: 'D' }] };
    const base = buildSchedule({ shapes: [shape], rhythm, bpm: 120, bars: [1], tuning: standard });
    const verse = buildSchedule({
      shapes: [shape],
      rhythm,
      bpm: 120,
      bars: [1],
      tuning: standard,
      section: 'verse',
    });
    const chorus = buildSchedule({
      shapes: [shape],
      rhythm,
      bpm: 120,
      bars: [1],
      tuning: standard,
      section: 'chorus',
    });
    expect(verse[0]?.velocity).toBeLessThan(base[0]?.velocity ?? 0);
    expect(chorus[0]?.velocity).toBe(base[0]?.velocity);
  });

  it('shifts pitch up by the capo fret', () => {
    const rhythm: RhythmPreset = { id: 'c', subdivision: 8, steps: [{ t: 0, dir: 'D' }] };
    const open = buildSchedule({ shapes: [shape], rhythm, bpm: 120, bars: [1], tuning: standard });
    const capoed = buildSchedule({
      shapes: [shape],
      rhythm,
      bpm: 120,
      bars: [1],
      tuning: standard,
      capo: 2,
    });
    const openMidis = open[0]?.strings.map((s) => s.midi) ?? [];
    const capoedMidis = capoed[0]?.strings.map((s) => s.midi) ?? [];
    expect(capoedMidis).toEqual(openMidis.map((m) => m + 2));
  });

  it('clamps spreadMs to the 8-20ms range', () => {
    const rhythm: RhythmPreset = { id: 'sp', subdivision: 8, steps: [{ t: 0, dir: 'D' }] };
    const tooLow = buildSchedule({
      shapes: [shape],
      rhythm,
      bpm: 120,
      bars: [1],
      tuning: standard,
      spreadMs: 1,
    });
    const tooHigh = buildSchedule({
      shapes: [shape],
      rhythm,
      bpm: 120,
      bars: [1],
      tuning: standard,
      spreadMs: 100,
    });
    expect(tooLow[0]?.strings[1]?.offset).toBeCloseTo(0.008, 9);
    expect(tooHigh[0]?.strings[1]?.offset).toBeCloseTo(0.02, 9);
  });

  it('adds one bar of clicks before bar 0, with beat 1 accented, scaled to bpm', () => {
    for (const bpm of [60, 120, 200]) {
      const events = buildSchedule({
        shapes: [],
        rhythm: oneStepPerBar,
        bpm,
        bars: [],
        tuning: standard,
        countIn: true,
      });
      expect(events).toHaveLength(4);
      expect(events.every((e) => e.bar === -1 && e.kind === 'click')).toBe(true);
      expect(events[0]?.accent).toBe(true);
      expect(events.slice(1).every((e) => !e.accent)).toBe(true);
      const barSeconds = (4 * 60) / bpm;
      expect(events[0]?.t).toBeCloseTo(-barSeconds, 9);
      expect(events[3]?.t).toBeCloseTo(-barSeconds / 4, 9);
    }
  });

  it('with empty shapes and no content, count-in produces only click events', () => {
    const events = buildSchedule({
      shapes: [],
      rhythm: oneStepPerBar,
      bpm: 120,
      bars: [],
      tuning: standard,
      countIn: true,
    });
    expect(events.every((e) => e.kind === 'click')).toBe(true);
  });

  it('computes the time of a far-future step as step * stepDur with no accumulated drift', () => {
    const bpm = 100;
    const stepDur = 15 / bpm;
    const events = buildSchedule({
      shapes: [shape],
      rhythm: oneStepPerBar,
      bpm,
      bars: [626],
      tuning: standard,
    });
    const target = events.find((e) => e.step === 10000);
    expect(target).toBeDefined();
    expect(target?.t).toBeCloseTo(10000 * stepDur, 9);
  });

  it('secondsToStep round-trips every event.t back to its own step', () => {
    const rhythm: RhythmPreset = {
      id: 'popish',
      subdivision: 8,
      steps: [
        { t: 0, dir: 'D' },
        { t: 2, dir: 'D' },
        { t: 3, dir: 'U' },
        { t: 5, dir: 'U' },
        { t: 6, dir: 'D' },
        { t: 7, dir: 'U' },
      ],
    };
    for (const bpm of [60, 97, 140, 200]) {
      const events = buildSchedule({
        shapes: [shape, otherShape],
        rhythm,
        bpm,
        bars: [2, 3],
        tuning: standard,
        countIn: true,
      });
      for (const event of events) {
        expect(secondsToStep(event.t, bpm)).toBe(event.step);
      }
    }
  });
});
