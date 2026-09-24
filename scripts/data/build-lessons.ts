// Builds src/data/lessons.json: runs the optimiser, adds an engine tip, checks every lesson
// (checkPlayable, checkHarmony, checkBars, lintAgainstStyle) and sorts each module by difficulty.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { analyseTransition } from '../../src/core/engine/analyseTransition.ts';
import { explainTransition } from '../../src/core/engine/explain.ts';
import { buildLesson, checkLesson } from '../../src/core/lessons/check.ts';
import { simplifyLesson } from '../../src/core/lessons/plan.ts';
import type { BuiltLesson } from '../../src/core/lessons/types.ts';
import { getShapes } from '../../src/core/shapes/library.ts';
import type { StyleSheet } from '../../src/core/style/types.ts';
import { STYLES } from '../../src/data/styles/index.ts';
import { LESSONS } from './lessons.src.ts';
import { RIFFS, TUNES } from './tunes.src.ts';
import type { BuiltRiff, TunesData } from '../../src/core/lessons/types.ts';
import { buildRiff } from '../../src/core/style/riffBuilder.ts';
import { lintAgainstStyle } from '../../src/core/style/lint.ts';
import { parseNote } from '../../src/core/theory/pitch.ts';

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
    const issues = [...checkLesson(lesson, style), ...checkLesson(simplifyLesson(lesson), style)];
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

const tunes: BuiltLesson[] = [];
for (const source of TUNES) {
  const style = STYLES[source.module];
  try {
    const tune = buildLesson(source, style);
    const issues = checkLesson(tune, style);
    if (issues.length > 0) {
      console.error(`${tune.id}: ${JSON.stringify(issues.slice(0, 5))}`);
      failed = true;
    }
    tunes.push(tune);
  } catch (error) {
    console.error(String(error));
    failed = true;
  }
}

const riffs: BuiltRiff[] = [];
for (const source of RIFFS) {
  const style = STYLES[source.module];
  try {
    const { piece } = buildRiff(style, {
      key: parseNote(source.key),
      bars: source.bars,
      seed: source.seed,
      difficulty: source.difficulty,
    });
    const issues = lintAgainstStyle(piece, style);
    if (issues.length > 0) {
      console.error(`${source.id}: ${JSON.stringify(issues)}`);
      failed = true;
    }
    riffs.push({
      id: source.id,
      module: source.module,
      title: source.title,
      unlockAfter: source.unlockAfter,
      bars: source.bars,
      piece: { ...piece, id: source.id },
    });
  } catch (error) {
    console.error(`${source.id}: ${String(error)}`);
    failed = true;
  }
}

if (failed) process.exit(1);

const tunesData: TunesData = { tunes, riffs };
const tunesOut = fileURLToPath(new URL('../../src/data/tunes.json', import.meta.url));
writeFileSync(tunesOut, `${JSON.stringify(tunesData, null, 2)}\n`);
console.log(
  `Wrote ${String(tunes.length)} tunes and ${String(riffs.length)} riffs to src/data/tunes.json`,
);

const sorted = MODULE_ORDER.flatMap((module) =>
  built.filter((lesson) => lesson.module === module).sort((a, b) => a.difficulty - b.difficulty),
);
const out = fileURLToPath(new URL('../../src/data/lessons.json', import.meta.url));
writeFileSync(out, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`Wrote ${String(sorted.length)} lessons to src/data/lessons.json`);
