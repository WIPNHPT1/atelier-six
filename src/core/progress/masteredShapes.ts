import { getShapes } from '../shapes/library.ts';
import type { BuiltLesson } from '../lessons/types.ts';
import type { Shape } from '../shapes/types.ts';
import type { ProgressData } from './schema.ts';

export type MasteredShape = { lessonId: string; chord: string; shape: Shape };

function targetShapeFor(lesson: BuiltLesson): { chord: string; shape: Shape } | null {
  const chord = lesson.chords[lesson.chords.length - 1];
  if (chord === undefined) return null;
  const id = lesson.shapes[chord];
  const shape = getShapes(chord).find((candidate) => candidate.id === id);
  return shape === undefined ? null : { chord, shape };
}

/** One entry per shape whose lesson has reached its target tempo, in lesson order,
 * deduplicated (several lessons can resolve to the same shape). */
export function masteredShapes(lessons: BuiltLesson[], data: ProgressData): MasteredShape[] {
  const results: MasteredShape[] = [];
  const seen = new Set<string>();
  for (const lesson of lessons) {
    const best = data.lessons[lesson.id]?.bestBpm ?? 0;
    if (best < lesson.targetBpm) continue;
    const target = targetShapeFor(lesson);
    if (target === null || seen.has(target.shape.id)) continue;
    seen.add(target.shape.id);
    results.push({ lessonId: lesson.id, chord: target.chord, shape: target.shape });
  }
  return results;
}
