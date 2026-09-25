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

// Browsing the whole course roadmap, unlike stepping through a lesson sequence: this
// walks every module in order, available or not (the module page shows "coming soon").
export function prevModule(id: string): ModuleMeta | undefined {
  const index = MODULES.findIndex((module) => module.id === id);
  return index > 0 ? MODULES[index - 1] : undefined;
}

export function nextModule(id: string): ModuleMeta | undefined {
  const index = MODULES.findIndex((module) => module.id === id);
  return index === -1 ? undefined : MODULES[index + 1];
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

export type SequenceStep =
  | { kind: 'lesson'; lesson: BuiltLesson }
  | { kind: 'module'; module: ModuleMeta };

// A module's sequence is its lessons (gentlest first), then its tune as the capstone.
function moduleSequence(moduleId: string): BuiltLesson[] {
  const tune = tuneFor(moduleId);
  return tune ? [...lessonsFor(moduleId), tune] : lessonsFor(moduleId);
}

export function nextStep(lesson: BuiltLesson): SequenceStep | null {
  const sequence = moduleSequence(lesson.module);
  const index = sequence.findIndex((item) => item.id === lesson.id);
  if (index === -1) return null;
  const following = sequence[index + 1];
  if (following) return { kind: 'lesson', lesson: following };

  const moduleIndex = MODULES.findIndex((module) => module.id === lesson.module);
  const nextModule = MODULES.slice(moduleIndex + 1).find((module) => module.available);
  return nextModule ? { kind: 'module', module: nextModule } : null;
}

// Going back continues into the previous module's last step (its tune, or its last
// lesson), the same way flipping back a page lands on the end of the prior chapter.
export function prevStep(lesson: BuiltLesson): SequenceStep | null {
  const sequence = moduleSequence(lesson.module);
  const index = sequence.findIndex((item) => item.id === lesson.id);
  if (index > 0) {
    const before = sequence[index - 1];
    return before ? { kind: 'lesson', lesson: before } : null;
  }

  const moduleIndex = MODULES.findIndex((module) => module.id === lesson.module);
  const prevModule = [...MODULES.slice(0, moduleIndex)].reverse().find((module) => module.available);
  if (!prevModule) return null;
  const prevSequence = moduleSequence(prevModule.id);
  const last = prevSequence[prevSequence.length - 1];
  return last ? { kind: 'lesson', lesson: last } : { kind: 'module', module: prevModule };
}
