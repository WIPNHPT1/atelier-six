import type { PreparedPlay } from '../../audio/transport';
import type { Level } from '../../app/settingsStore';
import { buildBand, type BandStyle } from '../../core/band/band';
import { optimise } from '../../core/engine/optimise';
import { rhythmFor } from '../../core/lessons/plan';
import { totalSeconds } from '../../core/schedule/arrangement';
import { buildSchedule } from '../../core/schedule/buildSchedule';
import { getChord, getShapes } from '../../core/shapes/library';
import type { Shape } from '../../core/shapes/types';
import type { StyleSheet } from '../../core/style/types';
import type { ChordSpec } from '../../core/theory/chord';
import { standard } from '../../core/tuning';
import { STYLES } from '../../data/styles';
import { recommendedLesson } from '../lesson/lessonData';

const BARS = 4;
const BAR_STEPS = 16;

type GrooveSpec = { chords: [string, string]; tags: string[]; rhythm: string; bpm: number };

// Music in the first minute: a two-chord groove in the style the player starts with.
const GROOVES: Record<BandStyle, GrooveSpec> = {
  power: { chords: ['E5', 'A5'], tags: ['power'], rhythm: 'eighths-open', bpm: 150 },
  open: { chords: ['Em', 'C'], tags: ['open'], rhythm: 'sixteenth-strum', bpm: 80 },
};

export type Groove = {
  module: BandStyle;
  shapes: [Shape, Shape];
  bpm: number;
  prepared: PreparedPlay;
};

function spec(chord: string): ChordSpec {
  const found = getChord(chord);
  return { root: found?.root ?? 0, quality: (found?.quality ?? 'maj') as ChordSpec['quality'] };
}

export function grooveFor(level: Level): Groove {
  const module = recommendedLesson(level).module;
  const { chords, tags, rhythm: rhythmId, bpm } = GROOVES[module];
  const candidates = chords.map((chord) =>
    getShapes(chord, { register: 'low' }).filter((shape) =>
      shape.tags.some((tag) => tags.includes(tag)),
    ),
  );
  const [a, b] = optimise(candidates, { loop: true }).shapes as [Shape, Shape];
  const bars = Array.from({ length: BARS }, (_, bar) => (bar % 2 === 0 ? a : b));
  const rhythm = rhythmFor(STYLES[module] as StyleSheet, rhythmId);
  const events = buildSchedule({
    shapes: bars,
    rhythm,
    bpm,
    bars: bars.map(() => 1),
    tuning: standard,
    section: 'chorus',
  });
  const band = buildBand(
    module,
    bars.map((shape, bar) => ({
      chord: spec(shape.chord),
      section: 'chorus',
      dynamics: 0.9,
      hits: rhythm.steps.map((step) => step.t),
      firstOfSection: bar === 0,
    })),
    bpm,
  );
  return {
    module,
    shapes: [a, b],
    bpm,
    prepared: { events, band, totalSeconds: totalSeconds(BARS, bpm) },
  };
}

export const GROOVE_STEPS = BARS * BAR_STEPS;
