import {
  checkBars,
  checkHarmony,
  checkPlayable,
  type Fingering,
  type Harmony,
  type TabEvent,
} from '../tab/playability.ts';
import type { Finger } from '../shapes/types.ts';
import { chordTones, romanToChord, type ChordSpec } from '../theory/chord.ts';
import type { PitchClass } from '../theory/pitch.ts';
import { dropD, halfDown, standard, type Tuning } from '../tuning.ts';
import type { Articulation, Piece, PieceEvent, StyleSheet, TuningId } from './types.ts';

export const TUNINGS: Record<TuningId, Tuning> = { standard, halfDown, dropD };

const STEPS_PER_BAR = 16;
// The "and" of beat 4, in sixteenths.
export const PUSH_STEP = 14;
const WINDOW_FRETS = 3;
const MAX_ATTEMPTS = 12;
const STRING_COUNT = 6;
const FOUR_FOUR = { top: 4, bottom: 4 };

export type Difficulty = 1 | 2 | 3;
export type RiffOptions = { key: PitchClass; bars: number; seed: number; difficulty: Difficulty };
export type Riff = { piece: Piece; tab: TabEvent[]; fingering: Fingering; harmonies: Harmony[] };

type Note = { string: number; fret: number; midi: number };
type Random = () => number;

function mulberry32(seed: number): Random {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function must<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Style data is missing a building block');
  return value;
}

function pick<T>(items: readonly T[], rand: Random): T {
  return must(items[Math.floor(rand() * items.length)]);
}

function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

function openMidi(tuning: Tuning, string: number, capo: number): number {
  return (tuning[STRING_COUNT - string] as number) + capo;
}

function harmonyFor(style: StyleSheet, chord: ChordSpec, key: PitchClass): Harmony {
  if (style.harmony.line === 'scale') return { root: key, tones: style.harmony.scale };
  return { root: chord.root, tones: chordTones(chord).map((pc) => mod12(pc - chord.root)) };
}

function ladder(
  style: StyleSheet,
  tuning: Tuning,
  capo: number,
  base: number,
  harmony: Harmony,
): Note[] {
  const allowed = new Set(harmony.tones.map((tone) => mod12(harmony.root + tone)));
  const frets = [0];
  for (let fret = Math.max(base, 1); fret <= base + WINDOW_FRETS; fret++) frets.push(fret);

  const notes: Note[] = [];
  for (const string of style.strings) {
    const open = openMidi(tuning, string, capo);
    for (const fret of frets) {
      if (allowed.has(mod12(open + fret))) notes.push({ string, fret, midi: open + fret });
    }
  }
  return notes.sort((a, b) => a.midi - b.midi || b.string - a.string);
}

function nearestIndex(notes: Note[], midi: number): number {
  return notes.reduce(
    (best, note, index) => {
      const distance = Math.abs(note.midi - midi);
      return distance < best.distance ? { index, distance } : best;
    },
    { index: 0, distance: Infinity },
  ).index;
}

function stepArticulations(
  step: StyleSheet['rhythmCells'][number]['steps'][number],
  accent: boolean,
) {
  const marks: Articulation[] = [];
  if (step.accent === true || accent) marks.push('accent');
  if (step.palmMute === true) marks.push('palm-mute');
  if (step.ghost === true) marks.push('ghost');
  if (step.dir === 'mute') marks.push('mute');
  return marks;
}

function attempt(style: StyleSheet, options: RiffOptions, seed: number): Riff | null {
  const { key, bars, difficulty } = options;
  const rand = mulberry32(seed);
  const tuningId = pick(style.tunings, rand);
  const tuning = TUNINGS[tuningId];
  const capo = style.capo.min;
  const chords = pick(style.progressions, rand).roman.map((roman) => romanToChord(roman, key));
  const requiredShape = style.mustInclude.find((rule) => rule.kind === 'phraseShape');
  const shapes = requiredShape
    ? style.phraseShapes.filter((shape) => shape.id === requiredShape.value)
    : style.phraseShapes;
  const shape = pick(shapes, rand);
  const cells = style.rhythmCells.filter((cell) => cell.level <= difficulty);
  const push = style.mustInclude.some((rule) => rule.kind === 'push');
  const accentSteps = new Set(
    style.mustInclude.flatMap((rule) => (rule.kind === 'accentOn' ? rule.steps : [])),
  );

  const lowest = Math.max(...style.strings);
  const base = mod12(key - openMidi(tuning, lowest, capo));
  const position = Math.max(base, 1);
  const first = ladder(style, tuning, capo, base, harmonyFor(style, must(chords[0]), key));
  const anchor = pick(first.slice(0, Math.ceil(first.length / 2)), rand).midi;

  const events: (PieceEvent & { articulations: Articulation[]; finger: Finger })[] = [];
  const harmonies: Harmony[] = [];
  let noteIndex = 0;
  for (let bar = 0; bar < bars; bar++) {
    const cell = pick(cells, rand);
    for (const [i, step] of cell.steps.entries()) {
      const duration = (cell.steps[i + 1]?.t ?? STEPS_PER_BAR) - step.t;
      const pushed = push && step.t === PUSH_STEP && bar + 1 < bars;
      const chord = must(chords[(bar + (pushed ? 1 : 0)) % chords.length]);
      const harmony = harmonyFor(style, chord, key);
      const notes = ladder(style, tuning, capo, base, harmony);
      const offset = must(shape.contour[noteIndex % shape.contour.length]);
      const target = Math.min(Math.max(nearestIndex(notes, anchor) + offset, 0), notes.length - 1);
      const note = must(notes[target]);
      noteIndex++;
      harmonies.push(harmony);
      events.push({
        bar,
        t: step.t,
        duration,
        string: note.string,
        fret: note.fret,
        dir: step.dir,
        finger: (note.fret === 0 ? 0 : note.fret - position + 1) as Finger,
        chord,
        articulations: stepArticulations(step, accentSteps.has(step.t)),
        passing: step.dir === 'mute',
      });
    }
  }

  for (const rule of style.mustInclude) {
    if (rule.kind !== 'articulation' || rule.scope !== 'riff') continue;
    if (events.some((event) => event.articulations.includes(rule.value))) continue;
    pick(
      events.filter((event) => event.fret > 0 && event.dir !== 'mute'),
      rand,
    ).articulations.push(rule.value);
  }

  const tab: TabEvent[] = events.map((event) => ({
    bar: event.bar,
    time: event.bar * STEPS_PER_BAR + event.t,
    duration: event.duration,
    string: event.string,
    fret: event.fret,
    passing: event.passing === true,
  }));
  const fingering = events.map((event) => event.finger);
  const issues = [
    ...checkPlayable(tab, fingering, style.tempo.max),
    ...tab.flatMap((event, i) => checkHarmony([event], must(harmonies[i]), tuning, capo)),
    ...checkBars(tab, FOUR_FOUR),
  ];
  if (issues.length > 0) return null;

  const piece: Piece = {
    id: `${style.id}-riff-${String(options.seed)}`,
    kind: 'riff',
    bpm: Math.round(style.tempo.min + ((style.tempo.max - style.tempo.min) * (difficulty - 1)) / 2),
    subdivision: style.feel.subdivision,
    swing: 50,
    tuning: tuningId,
    capo,
    phraseShape: shape.id,
    sections: [{ name: 'riff', events }],
  };
  return { piece, tab, fingering, harmonies };
}

// Builds a riff only from the style's own cells, progressions and phrase shapes; retries with
// derived seeds until the result is playable, in harmony and every bar adds up.
export function buildRiff(style: StyleSheet, options: RiffOptions): Riff {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    let riff: Riff | null = null;
    try {
      riff = attempt(style, options, options.seed * MAX_ATTEMPTS + i);
    } catch {
      riff = null;
    }
    if (riff !== null) return riff;
  }
  throw new Error(`Could not build a playable ${style.id} riff`);
}
