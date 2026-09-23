import { describe, expect, it } from 'vitest';
import { getShapes } from '../shapes/library.ts';
import { optimise } from './optimise.ts';
import { labelForAverageCost, scoreProgression } from './score.ts';

describe('labelForAverageCost', () => {
  it('is gentle below 4', () => {
    expect(labelForAverageCost(3.99)).toBe('gentle');
  });

  it('is moderate at exactly 4 and below 7', () => {
    expect(labelForAverageCost(4)).toBe('moderate');
    expect(labelForAverageCost(6.99)).toBe('moderate');
  });

  it('is demanding at exactly 7 and above', () => {
    expect(labelForAverageCost(7)).toBe('demanding');
    expect(labelForAverageCost(9)).toBe('demanding');
  });
});

describe('scoreProgression', () => {
  it('C -> Am (open) is gentle, cost ~3.67, hardest move is the finger-3 lift', () => {
    const score = scoreProgression(['C', 'Am'], { tags: ['open'] });

    expect(score.label).toBe('gentle');
    expect(score.perTransition).toHaveLength(1);
    const transition = score.perTransition[0];
    expect(transition?.from).toBe('C.open.a');
    expect(transition?.to).toBe('Am.open');
    expect(transition?.cost).toBe(3.67);
    expect(transition?.hardestMove?.kind).toBe('move');
    expect(transition?.hardestMove?.cost).toBeCloseTo(3.6708, 4);
    expect(score.total).toBe(transition?.cost);
  });

  it('G.open.a-only G->C is harder than when G.open.b is available', () => {
    const gOpenAOnly = getShapes('G', { tags: ['open'] }).filter((s) => s.id === 'G.open.a');
    const cOpen = getShapes('C', { tags: ['open'] });
    const restricted = optimise([gOpenAOnly, cOpen]);

    const full = scoreProgression(['G', 'C'], { tags: ['open'] });

    expect(restricted.total).toBeGreaterThan(full.total);
  });

  it('a loop includes the closing transition back to the first shape', () => {
    const score = scoreProgression(['E', 'A'], { tags: ['open'] }, { loop: true });

    expect(score.perTransition).toHaveLength(2);
    expect(score.perTransition[1]?.to).toBe(score.perTransition[0]?.from);
  });

  it('a single chord has no transitions and an empty (gentle) label', () => {
    const score = scoreProgression(['C'], { tags: ['open'] });

    expect(score.perTransition).toEqual([]);
    expect(score.label).toBe('gentle');
  });

  it('an all-grouped transition (power-chord shift) still finds a hardest move via its group', () => {
    const score = scoreProgression(['G5', 'A5'], { tags: ['power'] });

    expect(score.perTransition).toHaveLength(1);
    expect(score.perTransition[0]?.hardestMove?.kind).toBe('group');
  });

  it('an unresolvable loop (a chord with no candidates) scores as an empty, gentle result', () => {
    const score = scoreProgression(['G', 'NoSuchChord'], {}, { loop: true });

    expect(score.perTransition).toEqual([]);
    expect(score.label).toBe('gentle');
    expect(score.total).toBe(0);
  });
});
