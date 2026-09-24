import { describe, expect, it } from 'vitest';
import lessonsData from '../../data/lessons.json' with { type: 'json' };
import { STYLES } from '../../data/styles/index.ts';
import type { StyleSheet } from '../style/types.ts';
import { checkLesson } from './check.ts';
import { planSection, rhythmFor, shapeIdsFor, simplifyLesson } from './plan.ts';
import type { BuiltLesson } from './types.ts';

const LESSONS = lessonsData as BuiltLesson[];
const open = STYLES.open as StyleSheet;
const first = LESSONS.find((lesson) => lesson.module === 'open') as BuiltLesson;

describe('planSection', () => {
  it('lays out one shape per bar with the section rhythm', () => {
    const section = first.arrangement.sections[1];
    if (section === undefined) throw new Error('missing section');
    const plan = planSection(first, open, section);
    expect(plan.shapes).toHaveLength(section.bars);
    expect(plan.bars.every((bars) => bars === 1)).toBe(true);
    expect(plan.rhythm.id).toBe(section.rhythm);
    expect(plan.rhythm.subdivision).toBe(16);
    expect(plan.shapes.map((shape) => shape.chord)).toEqual(
      Array.from({ length: section.bars }, (_, bar) => first.chords[bar % first.chords.length]),
    );
  });

  it('keeps the lesson shapes when a register has no shape for a chord', () => {
    expect(shapeIdsFor(first, first.chords, 'high')).toEqual(
      Object.fromEntries(first.chords.map((chord) => [chord, first.shapes[chord]])),
    );
  });

  it('throws for an unknown rhythm or a missing shape', () => {
    expect(() => rhythmFor(open, 'nope')).toThrow(/nope/);
    const section = {
      ...(first.arrangement.sections[0] as BuiltLesson['arrangement']['sections'][number]),
      register: 'high' as const,
    };
    expect(() => planSection({ ...first, shapes: {} }, open, section)).toThrow(/No shape/);
  });
});

describe('simplifyLesson', () => {
  it('swaps each section to its easier rhythm and passes every check', () => {
    const easy = simplifyLesson(first);
    expect(easy.arrangement.sections.map((s) => s.rhythm)).not.toEqual(
      first.arrangement.sections.map((s) => s.rhythm),
    );
    expect(checkLesson(easy, open)).toEqual([]);
  });

  it('keeps a lesson without an easier part as it is', () => {
    const plain: BuiltLesson = { ...first };
    delete plain.easier;
    expect(simplifyLesson(plain)).toBe(plain);
    const partial = { ...first, easier: { rhythms: {} } };
    expect(simplifyLesson(partial).arrangement.sections.map((s) => s.rhythm)).toEqual(
      first.arrangement.sections.map((s) => s.rhythm),
    );
  });
});
