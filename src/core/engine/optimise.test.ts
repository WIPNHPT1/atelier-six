import { describe, expect, it } from 'vitest';
import { getShapes } from '../shapes/library.ts';
import { parseShape } from '../shapes/parseShape.ts';
import type { Shape } from '../shapes/types.ts';
import { analyseTransition } from './analyseTransition.ts';
import { shapeDifficulty, transitionCost } from './cost.ts';
import { candidatesFor, optimise } from './optimise.ts';

function openOrAnchored(name: string): Shape[] {
  return [...getShapes(name, { tags: ['open'] }), ...getShapes(name, { tags: ['anchored'] })];
}

describe('optimise', () => {
  it('[G, C] with two G candidates picks G.open.b (cheaper transition into C)', () => {
    const g = getShapes('G', { tags: ['open'] });
    const c = getShapes('C', { tags: ['open'] });

    const result = optimise([g, c]);

    expect(result.shapes.map((s) => s.id)).toEqual(['G.open.b', 'C.open.a']);
  });

  it('loop G-C-Em-D with open+anchored candidates: deterministic across 100 runs, total = sum of parts', () => {
    const chords = [
      openOrAnchored('G'),
      openOrAnchored('C'),
      openOrAnchored('Em'),
      openOrAnchored('D'),
    ];

    const first = optimise(chords, { loop: true });
    for (let i = 0; i < 100; i++) {
      expect(optimise(chords, { loop: true })).toEqual(first);
    }

    const shapeTotal = first.shapes.reduce((sum, shape) => sum + shapeDifficulty(shape), 0);
    const transitionTotal = first.transitions.reduce((sum, t) => sum + transitionCost(t), 0);
    expect(first.total).toBeCloseTo(shapeTotal + transitionTotal, 2);
    expect(first.transitions).toHaveLength(chords.length);

    const lastShape = first.shapes[first.shapes.length - 1] as Shape;
    const closing = first.transitions[first.transitions.length - 1];
    expect(closing).toEqual(analyseTransition(lastShape, first.shapes[0] as Shape));
  });

  it('power I-V-vi-IV in C: every transition is lift-free', () => {
    const chords = candidatesFor(['C5', 'G5', 'A5', 'F5'], { tags: ['power'] });

    const result = optimise(chords);

    for (const transition of result.transitions) {
      expect(transition.moves.every((move) => move.type !== 'lift')).toBe(true);
    }
  });

  it('a single chord picks its cheapest candidate and has no transitions', () => {
    const cheap = parseShape('cheap', 'X', 'x00000', '------');
    const costly = parseShape('costly', 'X', '(9)(9)(9)(9)(9)(9)', '111111', {
      barre: { fret: 9, from: 0, to: 5, finger: 1 },
    });

    const result = optimise([[costly, cheap]]);

    expect(result.shapes).toEqual([cheap]);
    expect(result.transitions).toEqual([]);
    expect(result.total).toBe(shapeDifficulty(cheap));
  });

  it('empty input returns total 0', () => {
    expect(optimise([])).toEqual({ shapes: [], transitions: [], total: 0 });
  });

  it('a chord with no candidates makes the whole progression unresolvable', () => {
    const cheap = parseShape('cheap', 'X', 'x00000', '------');
    expect(optimise([[cheap], []])).toEqual({ shapes: [], transitions: [], total: 0 });
  });

  it('a chord with no candidates makes every loop start unresolvable', () => {
    const cheap = parseShape('cheap', 'X', 'x00000', '------');
    expect(optimise([[cheap], []], { loop: true })).toEqual({
      shapes: [],
      transitions: [],
      total: 0,
    });
  });

  it('a chord with no candidates in the middle strands the chords after it too', () => {
    const cheap = parseShape('cheap', 'X', 'x00000', '------');
    expect(optimise([[cheap], [], [cheap]])).toEqual({ shapes: [], transitions: [], total: 0 });
  });

  it('throws when candidates exceed 400', () => {
    const shape = parseShape('dup', 'X', 'x00000', '------');
    const tooMany = [new Array<Shape>(401).fill(shape)];

    expect(() => optimise(tooMany)).toThrow(/400/);
  });
});
