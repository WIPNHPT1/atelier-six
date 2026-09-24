// Builds src/data/lessons.json: runs the optimiser, adds an engine tip, checks every lesson
// (checkPlayable, checkHarmony, checkBars, lintAgainstStyle) and sorts each module by difficulty.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { analyseTransition } from '../../src/core/engine/analyseTransition.ts';
import { explainTransition } from '../../src/core/engine/explain.ts';
import { buildLesson, checkLesson } from '../../src/core/lessons/check.ts';
import type { BuiltLesson } from '../../src/core/lessons/types.ts';
import { getShapes } from '../../src/core/shapes/library.ts';
import type { StyleSheet } from '../../src/core/style/types.ts';
import { STYLES } from '../../src/data/styles/index.ts';
import { LESSONS } from './lessons.src.ts';

const MAX_TIPS = 4;
const MODULE_ORDER = ['power', 'open'];

function engineTip(lesson: BuiltLesson): string | undefined {
  if (lesson.chords.length < 2) return undefined;
  const [first, second] = lesson.chords as [string, string];
  const shape = (chord: string) => getShapes(chord).find((s) => s.id === lesson.shapes[chord]);
  const a = shape(first);
  const b = shape(second);
  if (a === undefined || b === undefined) return undefined;
  return explainTransition(analyseTransition(a, b))[0];
}

let failed = false;
const built: BuiltLesson[] = [];

for (const source of LESSONS) {
  const style = STYLES[source.module] as StyleSheet | undefined;
  if (style === undefined) {
    console.error(`${source.id}: no style sheet for module ${source.module}`);
    failed = true;
    continue;
  }
  try {
    const lesson = buildLesson(source, style);
    const tip = engineTip(lesson);
    lesson.tips = [...(tip === undefined ? [] : [tip]), ...lesson.tips].slice(0, MAX_TIPS);
    const issues = checkLesson(lesson, style);
    if (issues.length > 0) {
      console.error(`${lesson.id}: ${JSON.stringify(issues.slice(0, 5))}`);
      failed = true;
    }
    built.push(lesson);
  } catch (error) {
    console.error(String(error));
    failed = true;
  }
}

if (failed) process.exit(1);

const sorted = MODULE_ORDER.flatMap((module) =>
  built.filter((lesson) => lesson.module === module).sort((a, b) => a.difficulty - b.difficulty),
);
const out = fileURLToPath(new URL('../../src/data/lessons.json', import.meta.url));
writeFileSync(out, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`Wrote ${String(sorted.length)} lessons to src/data/lessons.json`);
