import type { BuiltLesson } from '../../core/lessons/types';
import type { ProgressData } from '../../core/progress/schema';
import { lessonsFor } from '../lesson/lessonData';

// A lesson is done once it has been played cleanly at its target tempo.
export function lessonDone(lesson: BuiltLesson, data: ProgressData): boolean {
  return (data.lessons[lesson.id]?.bestBpm ?? 0) >= lesson.targetBpm;
}

export function bestBpm(lesson: BuiltLesson, data: ProgressData): number | null {
  const best = data.lessons[lesson.id]?.bestBpm ?? 0;
  return best > 0 ? best : null;
}

export type ModuleProgress = { done: number; total: number; started: boolean };

export function moduleProgress(module: string, data: ProgressData): ModuleProgress {
  const lessons = lessonsFor(module);
  return {
    done: lessons.filter((lesson) => lessonDone(lesson, data)).length,
    total: lessons.length,
    started: lessons.some((lesson) => data.lessons[lesson.id] !== undefined),
  };
}
