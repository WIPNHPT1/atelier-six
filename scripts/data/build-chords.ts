import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseShape } from '../../src/core/shapes/parseShape.ts';
import type { Shape } from '../../src/core/shapes/types.ts';
import { validateShape } from '../../src/core/shapes/validateShape.ts';
import { SHAPES } from './shapes.src.ts';

function registerFor(shape: Shape): Shape['register'] {
  const frettedNotes = shape.notes
    .map((note) => note.fret)
    .filter((fret): fret is number => fret !== null && fret > 0);
  const highest = frettedNotes.length > 0 ? Math.max(...frettedNotes) : 0;
  if (highest <= 5) return 'low';
  if (highest <= 9) return 'mid';
  return 'high';
}

let failed = false;
const grouped = new Map<string, Shape[]>();

for (const raw of SHAPES) {
  let shape: Shape;
  try {
    shape = parseShape(raw.id, raw.chord, raw.frets, raw.fingers, {
      tags: raw.tags,
      ...(raw.barre ? { barre: raw.barre } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to parse ${raw.id}: ${message}`);
    failed = true;
    continue;
  }

  shape = { ...shape, register: registerFor(shape) };

  const errors = validateShape(shape);
  if (errors.length > 0) {
    console.error(`Invalid shape ${shape.id}:`);
    for (const message of errors) console.error(`  - ${message}`);
    failed = true;
    continue;
  }

  const list = grouped.get(shape.chord) ?? [];
  list.push(shape);
  grouped.set(shape.chord, list);
}

if (failed) {
  console.error('Chord data generation failed.');
  process.exit(1);
}

const sortedNames = [...grouped.keys()].sort();
const output: Record<string, Shape[]> = {};
for (const name of sortedNames) {
  const shapes = (grouped.get(name) as Shape[]).slice().sort((a, b) => a.id.localeCompare(b.id));
  output[name] = shapes;
}

const outDir = fileURLToPath(new URL('../../src/data', import.meta.url));
mkdirSync(outDir, { recursive: true });
const outPath = fileURLToPath(new URL('../../src/data/chords.json', import.meta.url));
writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);

const shapeCount = sortedNames.reduce((sum, name) => sum + output[name].length, 0);
console.log(
  `Wrote ${String(sortedNames.length)} chords / ${String(shapeCount)} shapes to src/data/chords.json`,
);
