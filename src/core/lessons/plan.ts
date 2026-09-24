import type { RhythmPreset } from '../../data/rhythms.ts';
import { optimise } from '../engine/optimise.ts';
import { getShapes } from '../shapes/library.ts';
import type { Shape } from '../shapes/types.ts';
import type { StyleSheet } from '../style/types.ts';
import { candidateShapes } from './check.ts';
import type { ArrangementSection, BuiltLesson } from './types.ts';

export type SectionPlan = {
  section: ArrangementSection;
  chords: string[];
  // One entry per bar: the chord's shape and one bar each, ready for renderTab/buildSchedule.
  shapes: Shape[];
  bars: number[];
  rhythm: RhythmPreset;
};

function shapeById(chord: string, id: string | undefined): Shape {
  const shape = getShapes(chord).find((candidate) => candidate.id === id);
  if (shape === undefined) throw new Error(`No shape ${String(id)} for ${chord}`);
  return shape;
}

// Re-optimises the chords inside one register; if any chord has no shape there, keeps the
// lesson's own choice so the section still plays.
export function shapeIdsFor(
  lesson: BuiltLesson,
  chords: string[],
  register: Shape['register'],
): Record<string, string> {
  const inRegister = { ...lesson, candidates: { ...lesson.candidates, register } };
  const candidates = chords.map((chord) => candidateShapes(inRegister, chord));
  const ids: Record<string, string> = {};
  if (candidates.some((list) => list.length === 0)) {
    for (const chord of chords) ids[chord] = lesson.shapes[chord] as string;
    return ids;
  }
  for (const shape of optimise(candidates, { loop: true }).shapes) ids[shape.chord] ??= shape.id;
  return ids;
}

export function rhythmFor(style: StyleSheet, id: string): RhythmPreset {
  const cell = style.rhythmCells.find((candidate) => candidate.id === id);
  if (cell === undefined) throw new Error(`Unknown rhythm ${id} in ${style.id}`);
  return { id: cell.id, subdivision: 16, steps: cell.steps };
}

export function planSection(
  lesson: BuiltLesson,
  style: StyleSheet,
  section: ArrangementSection,
  register: Shape['register'] = section.register,
): SectionPlan {
  const chords = section.chords ?? lesson.chords;
  const ids = shapeIdsFor(lesson, chords, register);
  const shapes = Array.from({ length: section.bars }, (_, bar) => {
    const chord = chords[bar % chords.length] as string;
    return shapeById(chord, ids[chord]);
  });
  return {
    section,
    chords,
    shapes,
    bars: shapes.map(() => 1),
    rhythm: rhythmFor(style, section.rhythm),
  };
}

// The lesson with every section on its easier rhythm (fewer notes); unchanged if none is set.
export function simplifyLesson(lesson: BuiltLesson): BuiltLesson {
  const easier = lesson.easier;
  if (easier === undefined) return lesson;
  const sections = lesson.arrangement.sections.map((section) => ({
    ...section,
    rhythm: easier.rhythms[section.rhythm] ?? section.rhythm,
  }));
  return { ...lesson, arrangement: { sections } };
}
