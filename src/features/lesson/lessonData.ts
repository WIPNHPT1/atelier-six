import lessonsData from '../../data/lessons.json' with { type: 'json' };
import tunesData from '../../data/tunes.json' with { type: 'json' };
import type { Finish, Level } from '../../app/settingsStore';
import { labelForAverageCost, type ProgressionScore } from '../../core/engine/score';
import type { BuiltLesson, BuiltRiff, LessonModule, TunesData } from '../../core/lessons/types';

export const LESSONS = lessonsData as BuiltLesson[];
const TUNES_DATA = tunesData as TunesData;
export const TUNES: BuiltLesson[] = TUNES_DATA.tunes;
export const RIFFS: BuiltRiff[] = TUNES_DATA.riffs;

export function isTune(lesson: BuiltLesson): boolean {
  return TUNES.includes(lesson);
}

export function tuneFor(module: string): BuiltLesson | undefined {
  return TUNES.find((tune) => tune.module === module);
}

export function riffsFor(module: string): BuiltRiff[] {
  return RIFFS.filter((riff) => riff.module === module);
}

export type ModuleId = LessonModule | 'lead' | 'thumb' | 'whammy';

export type ModuleMeta = { id: ModuleId; number: number; finish: Finish; available: boolean };

export const MODULES: ModuleMeta[] = [
  { id: 'power', number: 1, finish: 'xerox', available: true },
  { id: 'open', number: 2, finish: 'sunburst', available: true },
  { id: 'lead', number: 3, finish: 'nitro', available: false },
  { id: 'thumb', number: 4, finish: 'faded', available: false },
  { id: 'whammy', number: 5, finish: 'stencil', available: false },
];

export function getModule(id: string | undefined): ModuleMeta | undefined {
  return MODULES.find((module) => module.id === id);
}

export function getLesson(id: string | undefined): BuiltLesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id) ?? TUNES.find((tune) => tune.id === id);
}

// lessons.json is already sorted gentlest first within each module.
export function lessonsFor(module: string): BuiltLesson[] {
  return LESSONS.filter((lesson) => lesson.module === module);
}

export function lessonNumber(lesson: BuiltLesson): number {
  return lessonsFor(lesson.module).indexOf(lesson) + 1;
}

export function difficultyLabel(lesson: BuiltLesson): ProgressionScore['label'] {
  return labelForAverageCost(lesson.difficulty / Math.max(1, lesson.chords.length));
}

export function firstLesson(): BuiltLesson {
  return LESSONS[0] as BuiltLesson;
}

// New players start with power chords; players who know some chords start on open shapes.
export function recommendedLesson(level: Level): BuiltLesson {
  const power = lessonsFor('power');
  const open = lessonsFor('open');
  if (level === 'someChords') return open[0] ?? firstLesson();
  if (level === 'confident') return power[Math.floor(power.length / 2)] ?? firstLesson();
  return power[0] ?? firstLesson();
}
