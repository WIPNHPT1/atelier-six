import { describe, expect, it } from 'vitest';
import lessonsData from '../../data/lessons.json' with { type: 'json' };
import { STYLES } from '../../data/styles/index.ts';
import { getChord, getShapes } from '../shapes/library.ts';
import type { StyleSheet } from '../style/types.ts';
import { candidateShapes, checkLesson } from './check.ts';
import type { BuiltLesson } from './types.ts';

const LESSONS = lessonsData as BuiltLesson[];

describe('lessons.json', () => {
  it('has 8 lessons in each of modules 1 and 2', () => {
    expect(LESSONS).toHaveLength(16);
    expect(LESSONS.filter((lesson) => lesson.module === 'power')).toHaveLength(8);
    expect(LESSONS.filter((lesson) => lesson.module === 'open')).toHaveLength(8);
    expect(new Set(LESSONS.map((lesson) => lesson.id)).size).toBe(16);
  });

  for (const lesson of LESSONS) {
    it(`${lesson.id} validates`, () => {
      const style = STYLES[lesson.module] as StyleSheet;
      expect(lesson.startBpm).toBeLessThan(lesson.targetBpm);
      expect(lesson.tips.length).toBeGreaterThanOrEqual(2);
      expect(lesson.tips.length).toBeLessThanOrEqual(4);
      expect(lesson.listen.length).toBeGreaterThan(0);
      for (const chord of lesson.chords) {
        expect(getChord(chord)).toBeDefined();
        expect(candidateShapes(lesson, chord).length).toBeGreaterThan(0);
        expect(getShapes(chord).map((shape) => shape.id)).toContain(lesson.shapes[chord]);
      }
      expect(checkLesson(lesson, style)).toEqual([]);
    });
  }

  it('orders each module by ascending difficulty', () => {
    for (const module of ['power', 'open']) {
      const difficulties = LESSONS.filter((l) => l.module === module).map((l) => l.difficulty);
      expect(difficulties).toEqual([...difficulties].sort((a, b) => a - b));
    }
  });
});
