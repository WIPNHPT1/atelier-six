import type { TabColumn } from '../tab/renderTab.ts';
import type { Shape } from '../shapes/types.ts';
import { stepDurSeconds, type ScheduleEvent } from './buildSchedule.ts';

const STEPS_PER_BAR = 16;

export type SchedulePart = { events: ScheduleEvent[]; bars: number };

// Plays sections back to back: times, steps and bars move on by each section's length, and
// chordIndex becomes the bar's index in the whole piece (one shape per bar).
export function chainSchedules(parts: SchedulePart[], bpm: number): ScheduleEvent[] {
  const stepDur = stepDurSeconds(bpm);
  let barOffset = 0;
  return parts.flatMap((part, index) => {
    const offset = barOffset;
    barOffset += part.bars;
    return part.events
      .filter((event) => index === 0 || event.bar >= 0)
      .map((event) => ({
        ...event,
        t: event.t + offset * STEPS_PER_BAR * stepDur,
        step: event.step + offset * STEPS_PER_BAR,
        bar: event.bar < 0 ? event.bar : event.bar + offset,
        chordIndex: event.chordIndex < 0 ? event.chordIndex : event.chordIndex + offset,
      }));
  });
}

export function totalSeconds(bars: number, bpm: number): number {
  return bars * STEPS_PER_BAR * stepDurSeconds(bpm);
}

export type TabPart = { columns: TabColumn[]; shapes: Shape[]; bars: number; label: string };

// One continuous tab for a whole arrangement, with a label on each section's first bar.
export function chainTab(parts: TabPart[]): {
  columns: TabColumn[];
  shapes: Shape[];
  sectionLabels: Record<number, string>;
} {
  let barOffset = 0;
  let shapeOffset = 0;
  let columnOffset = 0;
  const columns: TabColumn[] = [];
  const shapes: Shape[] = [];
  const sectionLabels: Record<number, string> = {};
  for (const part of parts) {
    sectionLabels[barOffset] = part.label;
    for (const column of part.columns) {
      columns.push({
        ...column,
        step: column.step + columnOffset,
        time: column.time + barOffset * STEPS_PER_BAR,
        bar: column.bar + barOffset,
        chordIndex: column.chordIndex + shapeOffset,
      });
    }
    shapes.push(...part.shapes);
    columnOffset += part.columns.length;
    barOffset += part.bars;
    shapeOffset += part.shapes.length;
  }
  return { columns, shapes, sectionLabels };
}
