import type { Finger } from '../shapes/types.ts';

export type RealFinger = Exclude<Finger, 0>;

export type Position = { string: number; fret: number };

export type Move = {
  finger: RealFinger;
  type: 'anchor' | 'guide' | 'lift' | 'place' | 'release' | 'group';
  from?: Position;
  to?: Position;
  groupIndex?: number;
};

export type Vector = { dString: number; dFret: number };

export type Group = {
  kind: 'slide' | 'shift';
  fingers: RealFinger[];
  vector: Vector;
};

export type Transition = {
  moves: Move[];
  groups: Group[];
};
