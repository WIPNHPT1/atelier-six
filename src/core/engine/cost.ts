import type { Shape } from '../shapes/types.ts';
import type { Group, Move, Transition } from './types.ts';

export const WEIGHTS = {
  move: {
    anchor: 0,
    guide: { base: 1, perFret: 0.25 },
    place: 2,
    release: 0,
    lift: { base: 3, perDistance: 0.3 },
  },
  group: {
    slide: { base: 1, perFret: 0.2 },
    shift: { base: 1.5, perFret: 0.25 },
  },
  difficulty: {
    perSpanFret: 2,
    freeSpan: 3,
    barre: 2,
    thumb: 1,
    interiorMute: 0.5,
  },
};

function moveCost(move: Move): number {
  switch (move.type) {
    case 'anchor':
      return WEIGHTS.move.anchor;
    case 'release':
      return WEIGHTS.move.release;
    case 'place':
      return WEIGHTS.move.place;
    case 'guide': {
      const dFret = (move.to?.fret ?? 0) - (move.from?.fret ?? 0);
      return WEIGHTS.move.guide.base + WEIGHTS.move.guide.perFret * Math.abs(dFret);
    }
    case 'lift': {
      const dString = (move.to?.string ?? 0) - (move.from?.string ?? 0);
      const dFret = (move.to?.fret ?? 0) - (move.from?.fret ?? 0);
      return (
        WEIGHTS.move.lift.base +
        WEIGHTS.move.lift.perDistance * Math.sqrt(dString ** 2 + dFret ** 2)
      );
    }
    case 'group':
      return 0;
  }
}

function groupCost(group: Group): number {
  const dFret = Math.abs(group.vector.dFret);
  return group.kind === 'slide'
    ? WEIGHTS.group.slide.base + WEIGHTS.group.slide.perFret * dFret
    : WEIGHTS.group.shift.base + WEIGHTS.group.shift.perFret * dFret;
}

export function transitionCost(transition: Transition): number {
  const moveTotal = transition.moves
    .filter((move) => move.type !== 'group')
    .reduce((sum, move) => sum + moveCost(move), 0);
  const groupTotal = transition.groups.reduce((sum, group) => sum + groupCost(group), 0);
  return Math.round((moveTotal + groupTotal) * 100) / 100;
}

function isInteriorMute(notes: Shape['notes'], index: number): boolean {
  if (notes[index]?.fret !== null) return false;
  const soundsBefore = notes.slice(0, index).some((note) => note.fret !== null);
  const soundsAfter = notes.slice(index + 1).some((note) => note.fret !== null);
  return soundsBefore && soundsAfter;
}

export function shapeDifficulty(shape: Shape): number {
  const frettedFrets = shape.notes
    .map((note) => note.fret)
    .filter((fret): fret is number => fret !== null && fret > 0);
  const span = frettedFrets.length > 0 ? Math.max(...frettedFrets) - Math.min(...frettedFrets) : 0;

  let difficulty = WEIGHTS.difficulty.perSpanFret * Math.max(0, span - WEIGHTS.difficulty.freeSpan);
  if (shape.barre) difficulty += WEIGHTS.difficulty.barre;
  if (shape.notes.some((note) => note.finger === 'T')) difficulty += WEIGHTS.difficulty.thumb;

  shape.notes.forEach((_note, index) => {
    if (isInteriorMute(shape.notes, index)) difficulty += WEIGHTS.difficulty.interiorMute;
  });

  return Math.round(difficulty * 100) / 100;
}
