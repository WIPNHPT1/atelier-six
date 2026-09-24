// Lints every generated riff, lesson and tune against its module's style sheet (PRD §20).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderLesson } from '../src/core/lessons/check.ts';
import type { BuiltLesson } from '../src/core/lessons/types.ts';
import { lintAgainstStyle } from '../src/core/style/lint.ts';
import { buildRiff, type Difficulty } from '../src/core/style/riffBuilder.ts';
import type { Piece, StyleSheet } from '../src/core/style/types.ts';
import { STYLES } from '../src/data/styles/index.ts';

const LESSONS_FILE = 'src/data/lessons.json';
const PIECE_DIRS = ['src/data/lessons', 'src/data/tunes', 'src/data/riffs'];
const SEEDS = 20;
const DIFFICULTIES: Difficulty[] = [1, 2, 3];

type StyledPiece = Piece & { style: string };

function jsonFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((name) => name.endsWith('.json') && !name.split('/').pop()?.startsWith('._'))
    .map((name) => join(dir, name));
}

const failures: string[] = [];
let checked = 0;

for (const [id, style] of Object.entries(STYLES)) {
  for (let seed = 1; seed <= SEEDS; seed++) {
    for (const difficulty of DIFFICULTIES) {
      checked++;
      try {
        const riff = buildRiff(style, { key: 0, bars: 4, seed, difficulty });
        const issues = lintAgainstStyle(riff.piece, style);
        if (issues.length > 0)
          failures.push(`${id} riff seed ${String(seed)}: ${JSON.stringify(issues)}`);
      } catch (error) {
        failures.push(`${id} riff seed ${String(seed)}: ${String(error)}`);
      }
    }
  }
}

for (const file of PIECE_DIRS.flatMap(jsonFiles)) {
  checked++;
  const piece = JSON.parse(readFileSync(file, 'utf8')) as StyledPiece;
  const style = STYLES[piece.style] as StyleSheet | undefined;
  if (style === undefined) {
    failures.push(`${file}: unknown style "${piece.style}"`);
    continue;
  }
  const issues = lintAgainstStyle(piece, style);
  if (issues.length > 0) failures.push(`${file}: ${JSON.stringify(issues)}`);
}

const lessons: BuiltLesson[] = existsSync(LESSONS_FILE)
  ? (JSON.parse(readFileSync(LESSONS_FILE, 'utf8')) as BuiltLesson[])
  : [];
for (const lesson of lessons) {
  checked++;
  const style = STYLES[lesson.module] as StyleSheet | undefined;
  if (style === undefined) {
    failures.push(`${lesson.id}: unknown style "${lesson.module}"`);
    continue;
  }
  const issues = lintAgainstStyle(renderLesson(lesson, style).piece, style);
  if (issues.length > 0) failures.push(`${lesson.id}: ${JSON.stringify(issues)}`);
}

if (failures.length > 0) {
  console.error(
    `Style lint failed (${String(failures.length)} of ${String(checked)}):\n${failures.join('\n')}`,
  );
  process.exit(1);
}
console.log(`Style lint passed: ${String(checked)} riffs, lessons and tunes.`);
