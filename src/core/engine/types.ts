import type { Finger } from '../shapes/types.ts';

export type RealFinger = Exclude<Finger, 0>;

export type Position = { string: number; fret: number };

export type Move = {
  finger: RealFinger;
  type: 'anchor' | 'guide' | 'lift' | 'place' | 'release';
  from?: Position;
  to?: Position;
};
