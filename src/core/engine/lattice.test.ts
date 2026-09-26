import { describe, expect, it } from 'vitest';
import { twoChordLattice } from './lattice';
import { optimise, candidatesFor } from './optimise';

describe('twoChordLattice', () => {
  it('has an edge for every pair of candidates and marks exactly one chosen', () => {
    const lattice = twoChordLattice('G', 'C');
    expect(lattice.from.length).toBeGreaterThan(0);
    expect(lattice.to.length).toBeGreaterThan(0);
    expect(lattice.edges).toHaveLength(lattice.from.length * lattice.to.length);
    expect(lattice.edges.filter((e) => e.chosen)).toHaveLength(1);
  });

  it('chooses the same path as the optimiser on the capped candidates', () => {
    const lattice = twoChordLattice('G', 'C', 2);
    const [g, c] = candidatesFor(['G', 'C']).map((shapes) => shapes.slice(0, 2));
    const best = optimise([g ?? [], c ?? []]);
    const chosen = lattice.edges.find((e) => e.chosen);
    expect(lattice.from[chosen?.from ?? -1]?.shape.id).toBe(best.shapes[0]?.id);
    expect(lattice.to[chosen?.to ?? -1]?.shape.id).toBe(best.shapes[1]?.id);
  });

  it('is empty for an unknown chord', () => {
    const lattice = twoChordLattice('X', 'C');
    expect(lattice.from).toEqual([]);
    expect(lattice.edges).toEqual([]);
  });
});
