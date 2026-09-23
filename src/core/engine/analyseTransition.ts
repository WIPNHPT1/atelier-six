import type { Shape } from '../shapes/types.ts';
import { classifyMoves } from './classifyMoves.ts';
import type { Group, Move, RealFinger, Transition } from './types.ts';

const FINGER_RANK: Record<RealFinger, number> = { 1: 1, 2: 2, 3: 3, 4: 4, T: 5 };

type VectorEntry = { dString: number; dFret: number; fingers: RealFinger[] };

export function analyseTransition(a: Shape, b: Shape): Transition {
  const moves = classifyMoves(a, b);

  const byVector = new Map<string, VectorEntry>();
  for (const move of moves) {
    if ((move.type !== 'guide' && move.type !== 'lift') || !move.from || !move.to) continue;
    const dString = move.to.string - move.from.string;
    const dFret = move.to.fret - move.from.fret;
    const key = `${String(dString)},${String(dFret)}`;
    const entry = byVector.get(key) ?? { dString, dFret, fingers: [] };
    entry.fingers.push(move.finger);
    byVector.set(key, entry);
  }

  const groups: Group[] = [...byVector.values()]
    .filter((entry) => entry.fingers.length >= 2)
    .map((entry) => ({
      kind: entry.dString === 0 ? ('slide' as const) : ('shift' as const),
      fingers: [...entry.fingers].sort((x, y) => FINGER_RANK[x] - FINGER_RANK[y]),
      vector: { dString: entry.dString, dFret: entry.dFret },
    }))
    .sort((g1, g2) => {
      const f1 = g1.fingers[0] as RealFinger;
      const f2 = g2.fingers[0] as RealFinger;
      return FINGER_RANK[f1] - FINGER_RANK[f2];
    });

  const groupIndexByFinger = new Map<RealFinger, number>();
  groups.forEach((group, index) => {
    for (const finger of group.fingers) groupIndexByFinger.set(finger, index);
  });

  const finalMoves: Move[] = moves.map((move) => {
    const groupIndex = groupIndexByFinger.get(move.finger);
    if (groupIndex === undefined) return move;
    return { ...move, type: 'group', groupIndex };
  });

  return { moves: finalMoves, groups };
}
