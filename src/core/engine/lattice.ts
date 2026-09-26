import { getShapes } from '../shapes/library.ts';
import type { Shape } from '../shapes/types.ts';
import { analyseTransition } from './analyseTransition.ts';
import { shapeDifficulty, transitionCost } from './cost.ts';
import { optimise } from './optimise.ts';

export type LatticeNode = { shape: Shape; cost: number };
export type LatticeEdge = { from: number; to: number; cost: number; chosen: boolean };
export type Lattice = { from: LatticeNode[]; to: LatticeNode[]; edges: LatticeEdge[] };

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function nodesOf(shapes: Shape[]): LatticeNode[] {
  return shapes.map((shape) => ({ shape, cost: round2(shapeDifficulty(shape)) }));
}

// A two-chord slice of the optimiser's lattice, small enough to draw: every candidate shape
// for each chord (capped), every edge between them, and the path `optimise` picks.
export function twoChordLattice(fromChord: string, toChord: string, maxShapes = 4): Lattice {
  const fromShapes = getShapes(fromChord).slice(0, maxShapes);
  const toShapes = getShapes(toChord).slice(0, maxShapes);
  const best = optimise([fromShapes, toShapes]);
  const chosenFrom = best.shapes[0]?.id;
  const chosenTo = best.shapes[1]?.id;

  const edges = fromShapes.flatMap((a, i) =>
    toShapes.map((b, j) => ({
      from: i,
      to: j,
      cost: round2(transitionCost(analyseTransition(a, b))),
      chosen: a.id === chosenFrom && b.id === chosenTo,
    })),
  );

  return { from: nodesOf(fromShapes), to: nodesOf(toShapes), edges };
}
