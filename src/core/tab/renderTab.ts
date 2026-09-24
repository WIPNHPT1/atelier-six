import type { RhythmPreset, RhythmStep } from '../../data/rhythms.ts';
import type { Shape } from '../shapes/types.ts';
import type { Tuning } from '../tuning.ts';

const STRING_COUNT = 6;
const SIXTEENTHS_PER_BAR_UNIT = 16;

// step: the column's index. time: where it sounds, in sixteenths from the start (the same
// clock as playback), so the playhead can light the column that is actually playing.
export type TabColumn = {
  step: number;
  time: number;
  bar: number;
  offset: number;
  duration: number;
  chordIndex: number;
  cells: (string | null)[];
  dir: RhythmStep['dir'];
  palmMute: boolean;
  accent: boolean;
  ghost: boolean;
};

function buildCells(shape: Shape, step: RhythmStep, stringCount: number): (string | null)[] {
  if (step.ghost === true) {
    return shape.notes.map(() => (step.palmMute === true ? 'x' : null));
  }
  const targets =
    step.strings === undefined
      ? undefined
      : new Set(step.strings.map((stringNumber) => stringCount - stringNumber));
  return shape.notes.map((note, index) => {
    if (targets !== undefined && !targets.has(index)) return null;
    return note.fret === null ? 'x' : String(note.fret);
  });
}

function stepTimings(rhythm: RhythmPreset): { offset: number; duration: number }[] {
  const multiplier = SIXTEENTHS_PER_BAR_UNIT / rhythm.subdivision;
  return rhythm.steps.map((step, index) => {
    const next = rhythm.steps[index + 1];
    const gap = next ? next.t - step.t : rhythm.subdivision - step.t;
    return { offset: step.t * multiplier, duration: gap * multiplier };
  });
}

export function renderTab(
  shapes: Shape[],
  rhythm: RhythmPreset,
  bars: number[],
  tuning: Tuning,
): TabColumn[] {
  const stringCount = tuning.length;
  const timings = stepTimings(rhythm);
  const columns: TabColumn[] = [];
  let step = 0;
  let bar = 0;

  shapes.forEach((shape, chordIndex) => {
    const barCount = bars[chordIndex] ?? 1;
    for (let b = 0; b < barCount; b++) {
      rhythm.steps.forEach((rhythmStep, index) => {
        const timing = timings[index] as { offset: number; duration: number };
        columns.push({
          step,
          time: bar * SIXTEENTHS_PER_BAR_UNIT + timing.offset,
          bar,
          offset: timing.offset,
          duration: timing.duration,
          chordIndex,
          cells: buildCells(shape, rhythmStep, stringCount),
          dir: rhythmStep.dir,
          palmMute: rhythmStep.palmMute === true,
          accent: rhythmStep.accent === true,
          ghost: rhythmStep.ghost === true,
        });
        step++;
      });
      bar++;
    }
  });

  return columns;
}

const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'];

export function toAscii(columns: TabColumn[]): string {
  const width = Math.max(
    1,
    ...columns.flatMap((column) =>
      column.cells.filter((cell): cell is string => cell !== null).map((cell) => cell.length),
    ),
  );

  const rows = STRING_LABELS.map((label, row) => {
    const index = STRING_COUNT - 1 - row;
    const cells = columns.map((column) => (column.cells[index] ?? '-').padEnd(width, '-'));
    return `${label}|-${cells.join('-')}-|`;
  });

  const rhythmWidth = Math.max(width, 2);
  const rhythmLine = columns.map((column) =>
    durationSymbol(column.duration).padEnd(rhythmWidth, '-'),
  );

  return [...rows, `  |-${rhythmLine.join('-')}-|`].join('\n');
}

const DOTTED_BASE: Record<number, number> = { 3: 2, 6: 4, 12: 8 };

export function durationSymbol(duration: number): string {
  const dotted = DOTTED_BASE[duration];
  const base = dotted ?? duration;
  const letter = base >= 16 ? 'w' : base >= 8 ? 'h' : base >= 4 ? 'q' : base >= 2 ? 'e' : 's';
  return dotted !== undefined ? `${letter}.` : letter;
}

// The column sounding at `playhead` (in sixteenths): the last one that has started, if the
// playhead is still inside it. -1 when nothing is sounding there.
export function activeColumn(columns: TabColumn[], playhead: number | undefined): number {
  if (playhead === undefined) return -1;
  let active = -1;
  for (const [index, column] of columns.entries()) {
    if (column.time > playhead) break;
    if (playhead < column.time + column.duration) active = index;
  }
  return active;
}
