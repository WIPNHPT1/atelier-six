import { describe, expect, it } from 'vitest';
import lessonsData from '../../data/lessons.json' with { type: 'json' };
import type { BuiltLesson } from '../lessons/types.ts';
import { masteredShapes } from './masteredShapes.ts';
import { emptyProgress } from './schema.ts';
import type { ProgressData } from './schema.ts';

const LESSONS = lessonsData as BuiltLesson[];
const first = LESSONS[0] as BuiltLesson;
const second = LESSONS[1] as BuiltLesson;

function withBestBpm(data: ProgressData, lessonId: string, bestBpm: number): ProgressData {
  return {
    ...data,
    lessons: {
      ...data.lessons,
      [lessonId]: {
        lessonId,
        bestBpm,
        cleanStreak: 0,
        lastPracticed: 0,
        completed: false,
      },
    },
  };
}

describe('masteredShapes', () => {
  it('returns nothing for an empty progress record', () => {
    expect(masteredShapes(LESSONS, emptyProgress())).toEqual([]);
  });

  it('returns nothing below target tempo', () => {
    const data = withBestBpm(emptyProgress(), first.id, first.targetBpm - 1);
    expect(masteredShapes([first], data)).toEqual([]);
  });

  it('includes the resolving chord once the target tempo is reached', () => {
    const data = withBestBpm(emptyProgress(), first.id, first.targetBpm);
    const result = masteredShapes([first], data);
    expect(result).toHaveLength(1);
    expect(result[0]?.lessonId).toBe(first.id);
    expect(result[0]?.chord).toBe(first.chords[first.chords.length - 1]);
    expect(result[0]?.shape.id).toBe(first.shapes[result[0]?.chord as string]);
  });

  it('dedupes lessons that resolve to the same shape', () => {
    let data = emptyProgress();
    data = withBestBpm(data, first.id, first.targetBpm);
    data = withBestBpm(data, first.id, first.targetBpm);
    const result = masteredShapes([first, first], data);
    expect(result).toHaveLength(1);
  });

  it('skips a lesson whose resolving chord has no shapes at all', () => {
    const broken: BuiltLesson = { ...first, chords: ['Nope'], shapes: { Nope: 'missing' } };
    const data = withBestBpm(emptyProgress(), broken.id, broken.targetBpm);
    expect(masteredShapes([broken], data)).toEqual([]);
  });

  it('skips a lesson with no chords', () => {
    const empty: BuiltLesson = { ...first, chords: [] };
    const data = withBestBpm(emptyProgress(), empty.id, empty.targetBpm);
    expect(masteredShapes([empty], data)).toEqual([]);
  });

  it('covers more than one mastered lesson', () => {
    let data = emptyProgress();
    data = withBestBpm(data, first.id, first.targetBpm);
    data = withBestBpm(data, second.id, second.targetBpm);
    expect(masteredShapes([first, second], data).length).toBeGreaterThanOrEqual(1);
  });
});
