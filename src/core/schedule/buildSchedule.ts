import type { RhythmPreset, RhythmStep } from '../../data/rhythms.ts';
import type { Shape } from '../shapes/types.ts';
import type { Tuning } from '../tuning.ts';
import { openStringMidi } from '../tuning.ts';

const SIXTEENTHS_PER_BAR = 16;
const SIXTEENTHS_PER_BEAT = 4;
const BEATS_PER_BAR = 4;
const MIN_SPREAD_MS = 8;
const MAX_SPREAD_MS = 20;
const DEFAULT_SPREAD_MS = 12;
const BASE_VELOCITY = 0.7;
const ACCENT_GAIN_DB = 4;
const ACCENT_GAIN = 10 ** (ACCENT_GAIN_DB / 20);

export type Section = 'verse' | 'chorus';

const SECTION_GAIN: Record<Section, number> = {
  verse: 0.75,
  chorus: 1,
};

export type ScheduleEventKind = 'strum' | 'pick' | 'click' | 'ghost';

export type StringHit = { string: number; midi: number; offset: number };

export type ScheduleEvent = {
  t: number;
  kind: ScheduleEventKind;
  step: number;
  bar: number;
  chordIndex: number;
  strings: StringHit[];
  dir: RhythmStep['dir'] | 'click';
  velocity: number;
  palmMute: boolean;
  accent: boolean;
};

export type ScheduleInput = {
  shapes: Shape[];
  rhythm: RhythmPreset;
  bpm: number;
  bars: number[];
  tuning: Tuning;
  capo?: number;
  countIn?: boolean;
  section?: Section;
  click?: boolean;
  spreadMs?: number;
};

export function stepDurSeconds(bpm: number): number {
  // one sixteenth note: a quarter note is 60/bpm seconds, a sixteenth is a quarter of that.
  return 15 / bpm;
}

export function secondsToStep(seconds: number, bpm: number): number {
  return Math.round(seconds / stepDurSeconds(bpm));
}

function clampSpread(spreadMs: number): number {
  return Math.min(MAX_SPREAD_MS, Math.max(MIN_SPREAD_MS, spreadMs));
}

function velocityFor(accent: boolean, section: Section | undefined): number {
  const accentGain = accent ? ACCENT_GAIN : 1;
  const sectionGain = section === undefined ? 1 : SECTION_GAIN[section];
  return BASE_VELOCITY * accentGain * sectionGain;
}

type StringSlot = { index: number; midi: number; fret: number | null };

function stringSlots(shape: Shape, tuning: Tuning, capo: number): StringSlot[] {
  const openMidi = openStringMidi(tuning, capo);
  const [t0, t1, t2, t3, t4, t5] = openMidi;
  const [n0, n1, n2, n3, n4, n5] = shape.notes;
  return [
    { index: 0, midi: t0, fret: n0.fret },
    { index: 1, midi: t1, fret: n1.fret },
    { index: 2, midi: t2, fret: n2.fret },
    { index: 3, midi: t3, fret: n3.fret },
    { index: 4, midi: t4, fret: n4.fret },
    { index: 5, midi: t5, fret: n5.fret },
  ];
}

function hasFret(slot: StringSlot): slot is StringSlot & { fret: number } {
  return slot.fret !== null;
}

function soundingStrings(
  shape: Shape,
  step: RhythmStep,
  tuning: Tuning,
  capo: number,
  spreadMs: number,
): StringHit[] {
  const stringCount = tuning.length;
  const targets = step.strings === undefined ? undefined : new Set(step.strings);
  const slots = stringSlots(shape, tuning, capo)
    .filter((slot) => {
      const stringNumber = stringCount - slot.index;
      return targets === undefined || targets.has(stringNumber);
    })
    .filter(hasFret);
  const ordered = step.dir === 'U' ? [...slots].reverse() : slots;
  return ordered.map((slot, position) => ({
    string: stringCount - slot.index,
    midi: slot.midi + slot.fret,
    offset: (position * spreadMs) / 1000,
  }));
}

function contentKind(step: RhythmStep): 'strum' | 'pick' | 'ghost' {
  if (step.ghost === true) return 'ghost';
  return step.dir === 'pick' ? 'pick' : 'strum';
}

function buildContentEvent(
  n: number,
  bar: number,
  chordIndex: number,
  shape: Shape,
  step: RhythmStep,
  tuning: Tuning,
  capo: number,
  spreadMs: number,
  stepDur: number,
  section: Section | undefined,
): ScheduleEvent {
  const accent = step.accent === true;
  return {
    t: n * stepDur,
    kind: contentKind(step),
    step: n,
    bar,
    chordIndex,
    strings: step.ghost === true ? [] : soundingStrings(shape, step, tuning, capo, spreadMs),
    dir: step.dir,
    velocity: velocityFor(accent, section),
    palmMute: step.palmMute === true,
    accent,
  };
}

function buildClickEvent(
  n: number,
  bar: number,
  chordIndex: number,
  stepDur: number,
  section: Section | undefined,
  accent: boolean,
): ScheduleEvent {
  return {
    t: n * stepDur,
    kind: 'click',
    step: n,
    bar,
    chordIndex,
    strings: [],
    dir: 'click',
    velocity: velocityFor(accent, section),
    palmMute: false,
    accent,
  };
}

function countInEvents(stepDur: number, section: Section | undefined): ScheduleEvent[] {
  return Array.from({ length: BEATS_PER_BAR }, (_, beat) => {
    const n = -SIXTEENTHS_PER_BAR + beat * SIXTEENTHS_PER_BEAT;
    return buildClickEvent(n, -1, -1, stepDur, section, beat === 0);
  });
}

export function buildSchedule(input: ScheduleInput): ScheduleEvent[] {
  const {
    shapes,
    rhythm,
    bpm,
    bars,
    tuning,
    capo = 0,
    countIn = false,
    section,
    click = false,
    spreadMs = DEFAULT_SPREAD_MS,
  } = input;
  const stepDur = stepDurSeconds(bpm);
  const spread = clampSpread(spreadMs);
  const multiplier = SIXTEENTHS_PER_BAR / rhythm.subdivision;

  const events: ScheduleEvent[] = countIn ? countInEvents(stepDur, section) : [];

  let globalBar = 0;
  shapes.forEach((shape, chordIndex) => {
    const barCount = bars[chordIndex] ?? 0;
    for (let b = 0; b < barCount; b++) {
      const barBase = globalBar * SIXTEENTHS_PER_BAR;
      rhythm.steps.forEach((step) => {
        const n = barBase + step.t * multiplier;
        events.push(
          buildContentEvent(
            n,
            globalBar,
            chordIndex,
            shape,
            step,
            tuning,
            capo,
            spread,
            stepDur,
            section,
          ),
        );
      });
      if (click) {
        for (let beat = 0; beat < BEATS_PER_BAR; beat++) {
          const n = barBase + beat * SIXTEENTHS_PER_BEAT;
          events.push(buildClickEvent(n, globalBar, chordIndex, stepDur, section, beat === 0));
        }
      }
      globalBar++;
    }
  });

  return events;
}
