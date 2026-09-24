import type { RhythmPreset, RhythmStep } from '../../data/rhythms.ts';
import type { Shape } from '../shapes/types.ts';
import type { Tuning } from '../tuning.ts';

const STRING_COUNT = 6;

export type TabColumn = {
  step: number;
  chordIndex: number;
  cells: (string | null)[];
  dir: RhythmStep['dir'];
  palmMute: boolean;
  accent: boolean;
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

export function renderTab(
  shapes: Shape[],
  rhythm: RhythmPreset,
  bars: number[],
  tuning: Tuning,
): TabColumn[] {
  const stringCount = tuning.length;
  const columns: TabColumn[] = [];
  let step = 0;

  shapes.forEach((shape, chordIndex) => {
    const barCount = bars[chordIndex] ?? 1;
    for (let bar = 0; bar < barCount; bar++) {
      for (const rhythmStep of rhythm.steps) {
        columns.push({
          step,
          chordIndex,
          cells: buildCells(shape, rhythmStep, stringCount),
          dir: rhythmStep.dir,
          palmMute: rhythmStep.palmMute === true,
          accent: rhythmStep.accent === true,
        });
        step++;
      }
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

  return rows.join('\n');
}
