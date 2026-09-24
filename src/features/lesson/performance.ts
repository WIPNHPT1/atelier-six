import type { PreparedPlay } from '../../audio/transport';
import { buildBand, type BandBar, type BandStyle } from '../../core/band/band';
import { planSection, type SectionPlan } from '../../core/lessons/plan';
import type { BuiltLesson } from '../../core/lessons/types';
import { chainSchedules, chainTab, totalSeconds } from '../../core/schedule/arrangement';
import { buildSchedule, type Section } from '../../core/schedule/buildSchedule';
import { getChord } from '../../core/shapes/library';
import type { Shape } from '../../core/shapes/types';
import type { StyleSheet } from '../../core/style/types';
import { renderTab } from '../../core/tab/renderTab';
import type { ChordSpec } from '../../core/theory/chord';
import type { Tuning } from '../../core/tuning';

// Sections at or above this dynamics level play at full (chorus) strength.
export const LOUD_DYNAMICS = 0.9;

export function levelFor(dynamics: number): Section {
  return dynamics >= LOUD_DYNAMICS ? 'chorus' : 'verse';
}

function chordOf(shape: Shape): ChordSpec {
  const chord = getChord(shape.chord);
  return { root: chord?.root ?? 0, quality: (chord?.quality ?? 'maj') as ChordSpec['quality'] };
}

export type Performance = {
  plans: SectionPlan[];
  shapes: Shape[];
  columns: ReturnType<typeof chainTab>['columns'];
  sectionLabels: Record<number, string>;
  bars: number;
};

// Every section in order as one tab, for the tune's performance mode.
export function planPerformance(
  lesson: BuiltLesson,
  style: StyleSheet,
  tuning: Tuning,
  label: (name: SectionPlan['section']['name']) => string,
): Performance {
  const plans = lesson.arrangement.sections.map((section) => planSection(lesson, style, section));
  const tab = chainTab(
    plans.map((plan) => ({
      columns: renderTab(plan.shapes, plan.rhythm, plan.bars, tuning),
      shapes: plan.shapes,
      bars: plan.shapes.length,
      label: label(plan.section.name),
    })),
  );
  return { plans, ...tab, bars: tab.shapes.length };
}

export type PerformanceOptions = {
  bpm: number;
  tuning: Tuning;
  capo: number;
  countIn: boolean;
  click: boolean;
};

// The whole tune with its band, built up front for one pass from start to finish.
export function preparePerformance(
  performance: Performance,
  style: BandStyle,
  options: PerformanceOptions,
): PreparedPlay {
  const { bpm, tuning, capo, countIn, click } = options;
  const events = chainSchedules(
    performance.plans.map((plan, index) => ({
      events: buildSchedule({
        shapes: plan.shapes,
        rhythm: plan.rhythm,
        bars: plan.bars,
        bpm,
        tuning,
        capo,
        click,
        countIn: countIn && index === 0,
        section: levelFor(plan.section.dynamics),
      }),
      bars: plan.shapes.length,
    })),
    bpm,
  );
  const bandBars: BandBar[] = performance.plans.flatMap((plan) =>
    plan.shapes.map((shape, bar) => ({
      chord: chordOf(shape),
      section: plan.section.name,
      dynamics: plan.section.dynamics,
      hits: plan.rhythm.steps.map((step) => step.t),
      firstOfSection: bar === 0,
    })),
  );
  return {
    events,
    band: buildBand(style, bandBars, bpm),
    totalSeconds: totalSeconds(performance.bars, bpm),
  };
}
