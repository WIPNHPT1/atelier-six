import { analyseTransition } from '../engine/analyseTransition.ts';
import { transitionCost } from '../engine/cost.ts';
import { stepDurSeconds, type ScheduleEvent } from '../schedule/buildSchedule.ts';
import type { Shape } from '../shapes/types.ts';

const STEPS_PER_BAR = 16;
const STEPS_PER_BEAT = 4;
export const LOOP_BARS_EACH = 2;
export const DEFAULT_FREEZE_SECONDS = 3;

export type DrillKind = 'loop' | 'early' | 'freeze' | 'minute';

export type DrillPlan = { shapes: [Shape, Shape]; bars: [number, number] };

// A↔B, two bars each, looped.
export function twoChordLoop(from: Shape, to: Shape): DrillPlan {
  return { shapes: [from, to], bars: [LOOP_BARS_EACH, LOOP_BARS_EACH] };
}

export type ChangeMark = { step: number; target: number };

// "Change now" lands on beat 4 of each chord's last bar, pointing at the next chord.
export function earlyChangeMarks(bars: readonly number[]): ChangeMark[] {
  let barline = 0;
  return bars.map((count, index) => {
    barline += count * STEPS_PER_BAR;
    return { step: barline - STEPS_PER_BEAT, target: (index + 1) % bars.length };
  });
}

export function activeMark(marks: ChangeMark[], step: number): ChangeMark | undefined {
  return marks.find((mark) => step >= mark.step && step < mark.step + STEPS_PER_BEAT);
}

export type FreezeWindow = { fromStep: number; toStep: number; chordIndex: number };

// Pauses on the first strum of every chord for `seconds`, pushing everything after it later.
// Steps are recomputed from the shifted times so the playhead stays in sync.
export function applyFreezes(
  events: ScheduleEvent[],
  bpm: number,
  seconds: number,
): { events: ScheduleEvent[]; windows: FreezeWindow[] } {
  const stepDur = stepDurSeconds(bpm);
  const sorted = [...events].sort((a, b) => a.t - b.t);
  const changes: { t: number; chordIndex: number }[] = [];
  for (const event of sorted) {
    if (event.kind === 'click' || event.chordIndex === changes.at(-1)?.chordIndex) continue;
    changes.push({ t: event.t, chordIndex: event.chordIndex });
  }
  const shiftFor = (t: number) => changes.filter((change) => change.t < t).length * seconds;
  const shifted = sorted.map((event) => {
    const t = event.t + shiftFor(event.t);
    return { ...event, t, step: Math.round(t / stepDur) };
  });
  const windows = changes.map((change, index) => {
    const fromStep = Math.round((change.t + index * seconds) / stepDur);
    return {
      fromStep,
      toStep: fromStep + Math.round(seconds / stepDur),
      chordIndex: change.chordIndex,
    };
  });
  return { events: shifted, windows };
}

export function activeFreeze(windows: FreezeWindow[], step: number): FreezeWindow | undefined {
  return windows.find((window) => step >= window.fromStep && step < window.toStep);
}

// The costliest change in a looped chord sequence, for "Drill this change".
export function hardestTransition(shapes: Shape[]): { from: Shape; to: Shape } | null {
  const pairs = shapes.flatMap((from, index) => {
    const to = shapes[(index + 1) % shapes.length] as Shape;
    return to.id === from.id
      ? []
      : [{ from, to, cost: transitionCost(analyseTransition(from, to)) }];
  });
  const hardest = pairs.reduce<(typeof pairs)[number] | null>(
    (best, pair) => (best === null || pair.cost > best.cost ? pair : best),
    null,
  );
  return hardest === null ? null : { from: hardest.from, to: hardest.to };
}
