import type { Shape } from './types.ts';

export function pitchesOf(shape: Shape, tuning: number[], capo = 0): Array<number | null> {
  return shape.notes.map((note, index) => {
    if (note.fret === null) return null;
    return (tuning[index] as number) + capo + note.fret;
  });
}
