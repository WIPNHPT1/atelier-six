import { getShapes, type ShapeFilter } from '../shapes/library.ts';
import type { Shape } from '../shapes/types.ts';
import { analyseTransition } from './analyseTransition.ts';
import { shapeDifficulty, transitionCost } from './cost.ts';
import type { Transition } from './types.ts';

const MAX_CANDIDATES = 400;
const TIE_EPSILON = 1e-6;

export type OptimiseOptions = { loop?: boolean };

export type Result = {
  shapes: Shape[];
  transitions: Transition[];
  total: number;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function isBetter(costA: number, idA: string, costB: number, idB: string): boolean {
  if (costA < costB - TIE_EPSILON) return true;
  if (costA > costB + TIE_EPSILON) return false;
  return idA < idB;
}

function isNonEmpty<T>(arr: T[]): arr is [T, ...T[]] {
  return arr.length > 0;
}

function totalCandidates(chords: Shape[][]): number {
  return chords.reduce((sum, candidates) => sum + candidates.length, 0);
}

type Node = { shape: Shape; path: Shape[]; cost: number };
type Chain = { shapes: Shape[]; transitions: Transition[]; total: number };

function nextNodes(prevNodes: Node[], currCandidates: Shape[]): Node[] {
  if (!isNonEmpty(prevNodes)) return [];
  const [firstPrev, ...restPrev] = prevNodes;

  return currCandidates.map((shapeK) => {
    let best = {
      cost: firstPrev.cost + transitionCost(analyseTransition(firstPrev.shape, shapeK)),
      id: firstPrev.shape.id,
      path: firstPrev.path,
    };

    for (const prevNode of restPrev) {
      const candidateCost =
        prevNode.cost + transitionCost(analyseTransition(prevNode.shape, shapeK));
      if (isBetter(candidateCost, prevNode.shape.id, best.cost, best.id)) {
        best = { cost: candidateCost, id: prevNode.shape.id, path: prevNode.path };
      }
    }

    return {
      shape: shapeK,
      path: [...best.path, shapeK],
      cost: shapeDifficulty(shapeK) + best.cost,
    };
  });
}

function buildTransitions(shapes: Shape[]): Transition[] {
  return shapes.reduce<{ prev: Shape | null; result: Transition[] }>(
    (acc, shape) => {
      if (acc.prev !== null) acc.result.push(analyseTransition(acc.prev, shape));
      return { prev: shape, result: acc.result };
    },
    { prev: null, result: [] },
  ).result;
}

function runChain(chords: Shape[][]): Chain {
  let nodes: Node[] = [];

  chords.forEach((candidates, i) => {
    nodes =
      i === 0
        ? candidates.map((shape) => ({ shape, path: [shape], cost: shapeDifficulty(shape) }))
        : nextNodes(nodes, candidates);
  });

  if (!isNonEmpty(nodes)) return { shapes: [], transitions: [], total: 0 };

  const [firstNode, ...restNodes] = nodes;
  let best = firstNode;
  for (const node of restNodes) {
    if (isBetter(node.cost, node.shape.id, best.cost, best.shape.id)) best = node;
  }

  return { shapes: best.path, transitions: buildTransitions(best.path), total: round2(best.cost) };
}

export function optimise(chords: Shape[][], options: OptimiseOptions = {}): Result {
  if (!isNonEmpty(chords)) return { shapes: [], transitions: [], total: 0 };

  if (totalCandidates(chords) > MAX_CANDIDATES) {
    throw new Error(
      `optimise: ${String(totalCandidates(chords))} candidates exceeds the limit of ${String(MAX_CANDIDATES)}`,
    );
  }

  if (!options.loop) {
    return runChain(chords);
  }

  const [firstCandidates, ...rest] = chords;

  let best: Chain | null = null;
  let bestStartId = '';

  for (const start of firstCandidates) {
    const chain = runChain([[start], ...rest]);
    const lastShape = chain.shapes[chain.shapes.length - 1];
    if (lastShape === undefined) continue;
    const closing = analyseTransition(lastShape, start);
    const total = round2(chain.total + transitionCost(closing));

    if (best === null || isBetter(total, start.id, best.total, bestStartId)) {
      best = { shapes: chain.shapes, transitions: [...chain.transitions, closing], total };
      bestStartId = start.id;
    }
  }

  return best ?? { shapes: [], transitions: [], total: 0 };
}

export function candidatesFor(chordNames: string[], filter: ShapeFilter = {}): Shape[][] {
  return chordNames.map((name) => getShapes(name, filter));
}
