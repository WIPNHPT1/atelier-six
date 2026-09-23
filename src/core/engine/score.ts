import type { ShapeFilter } from '../shapes/library.ts';
import type { Shape } from '../shapes/types.ts';
import { analyseTransition } from './analyseTransition.ts';
import { groupCost, moveCost, transitionCost } from './cost.ts';
import { candidatesFor, optimise, type OptimiseOptions } from './optimise.ts';
import type { Group, Move, Transition } from './types.ts';

export type HardestMove =
  { kind: 'move'; move: Move; cost: number } | { kind: 'group'; group: Group; cost: number };

export type TransitionScore = {
  from: string;
  to: string;
  cost: number;
  hardestMove: HardestMove | null;
};

export type ProgressionScore = {
  total: number;
  perTransition: TransitionScore[];
  label: 'gentle' | 'moderate' | 'demanding';
};

const GENTLE_MAX = 4;
const MODERATE_MAX = 7;

export function labelForAverageCost(averageCost: number): ProgressionScore['label'] {
  if (averageCost < GENTLE_MAX) return 'gentle';
  if (averageCost < MODERATE_MAX) return 'moderate';
  return 'demanding';
}

function hardestMoveIn(transition: Transition): HardestMove | null {
  let best: HardestMove | null = null;

  for (const move of transition.moves) {
    if (move.type === 'group') continue;
    const cost = moveCost(move);
    if (best === null || cost > best.cost) best = { kind: 'move', move, cost };
  }

  for (const group of transition.groups) {
    const cost = groupCost(group);
    if (best === null || cost > best.cost) best = { kind: 'group', group, cost };
  }

  return best;
}

function scoreTransition(from: Shape, to: Shape): TransitionScore {
  const transition = analyseTransition(from, to);
  return {
    from: from.id,
    to: to.id,
    cost: transitionCost(transition),
    hardestMove: hardestMoveIn(transition),
  };
}

function scoreShapes(shapes: Shape[], loop: boolean): TransitionScore[] {
  const scores: TransitionScore[] = [];
  let endpoints: { first: Shape; last: Shape } | null = null;
  let prev: Shape | null = null;

  for (const shape of shapes) {
    endpoints = { first: endpoints === null ? shape : endpoints.first, last: shape };
    if (prev !== null) scores.push(scoreTransition(prev, shape));
    prev = shape;
  }

  if (loop && endpoints !== null) scores.push(scoreTransition(endpoints.last, endpoints.first));

  return scores;
}

export function scoreProgression(
  chordNames: string[],
  filter: ShapeFilter = {},
  options: OptimiseOptions = {},
): ProgressionScore {
  const result = optimise(candidatesFor(chordNames, filter), options);
  const perTransition = scoreShapes(result.shapes, options.loop === true);

  const averageCost =
    perTransition.length > 0
      ? perTransition.reduce((sum, t) => sum + t.cost, 0) / perTransition.length
      : 0;

  return { total: result.total, perTransition, label: labelForAverageCost(averageCost) };
}
