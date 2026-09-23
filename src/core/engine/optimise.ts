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

function totalCandidates(chords: Shape[][]): number {
  return chords.reduce((sum, candidates) => sum + candidates.length, 0);
}

type Row = { candidates: Shape[]; costs: number[] };
type Chain = { shapes: Shape[]; transitions: Transition[]; total: number };

function nextRow(prev: Row, currCandidates: Shape[]): { row: Row; back: number[] } {
  const costs: number[] = [];
  const back: number[] = [];

  for (const shapeK of currCandidates) {
    let bestCost = Infinity;
    let bestId = '';
    let bestJ = 0;

    prev.candidates.forEach((shapeJ, j) => {
      const prevCost = prev.costs[j];
      if (prevCost === undefined) return;
      const edgeCost = transitionCost(analyseTransition(shapeJ, shapeK));
      const candidateCost = prevCost + edgeCost;
      if (isBetter(candidateCost, shapeJ.id, bestCost, bestId)) {
        bestCost = candidateCost;
        bestId = shapeJ.id;
        bestJ = j;
      }
    });

    costs.push(shapeDifficulty(shapeK) + bestCost);
    back.push(bestJ);
  }

  return { row: { candidates: currCandidates, costs }, back };
}

function bestIndex(row: Row): { cost: number; index: number } {
  let bestCost = Infinity;
  let bestId = '';
  let bestK = 0;

  row.candidates.forEach((shape, k) => {
    const cost = row.costs[k];
    if (cost === undefined) return;
    if (isBetter(cost, shape.id, bestCost, bestId)) {
      bestCost = cost;
      bestId = shape.id;
      bestK = k;
    }
  });

  return { cost: bestCost, index: bestK };
}

function backtrack(backRows: number[][], finalIndex: number): number[] {
  const pathIndices: number[] = [finalIndex];

  for (let i = backRows.length - 1; i >= 0; i--) {
    const backRow = backRows[i];
    const current = pathIndices[0];
    if (backRow === undefined || current === undefined) break;
    const prevIndex = backRow[current];
    if (prevIndex === undefined) break;
    pathIndices.unshift(prevIndex);
  }

  return pathIndices;
}

function runChain(chords: Shape[][]): Chain {
  const [first, ...rest] = chords;
  if (first === undefined) {
    return { shapes: [], transitions: [], total: 0 };
  }

  let row: Row = { candidates: first, costs: first.map((shape) => shapeDifficulty(shape)) };
  const backRows: number[][] = [];

  for (const currCandidates of rest) {
    const { row: nextR, back } = nextRow(row, currCandidates);
    backRows.push(back);
    row = nextR;
  }

  const { cost: total, index: finalIndex } = bestIndex(row);
  const pathIndices = backtrack(backRows, finalIndex);

  const shapes: Shape[] = [];
  chords.forEach((candidates, i) => {
    const idx = pathIndices[i];
    const shape = idx === undefined ? undefined : candidates[idx];
    if (shape !== undefined) shapes.push(shape);
  });

  const transitions: Transition[] = [];
  for (let i = 1; i < shapes.length; i++) {
    const from = shapes[i - 1];
    const to = shapes[i];
    if (from !== undefined && to !== undefined) transitions.push(analyseTransition(from, to));
  }

  return { shapes, transitions, total: round2(total) };
}

export function optimise(chords: Shape[][], options: OptimiseOptions = {}): Result {
  if (chords.length === 0) return { shapes: [], transitions: [], total: 0 };

  if (totalCandidates(chords) > MAX_CANDIDATES) {
    throw new Error(
      `optimise: ${String(totalCandidates(chords))} candidates exceeds the limit of ${String(MAX_CANDIDATES)}`,
    );
  }

  if (!options.loop) {
    return runChain(chords);
  }

  const [firstCandidates, ...rest] = chords;
  if (firstCandidates === undefined) {
    return { shapes: [], transitions: [], total: 0 };
  }

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
