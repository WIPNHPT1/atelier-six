import type { Shape } from '../shapes/types.ts';
import type { Move, Position, RealFinger } from './types.ts';

const FINGER_ORDER: RealFinger[] = [1, 2, 3, 4, 'T'];

function findFinger(shape: Shape, finger: RealFinger): Position | undefined {
  const string = shape.notes.findIndex((note) => note.finger === finger);
  if (string === -1) return undefined;
  const fret = shape.notes[string]?.fret;
  return fret === null || fret === undefined ? undefined : { string, fret };
}

export function classifyMoves(a: Shape, b: Shape): Move[] {
  const moves: Move[] = [];

  for (const finger of FINGER_ORDER) {
    const from = findFinger(a, finger);
    const to = findFinger(b, finger);

    if (from && to) {
      const dString = to.string - from.string;
      const dFret = to.fret - from.fret;
      if (dString === 0 && dFret === 0) {
        moves.push({ finger, type: 'anchor', from, to });
      } else if (dString === 0) {
        moves.push({ finger, type: 'guide', from, to });
      } else {
        moves.push({ finger, type: 'lift', from, to });
      }
    } else if (from && !to) {
      moves.push({ finger, type: 'release', from });
    } else if (!from && to) {
      moves.push({ finger, type: 'place', to });
    }
  }

  return moves;
}
