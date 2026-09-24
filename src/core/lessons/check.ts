import { optimise } from '../engine/optimise.ts';
import { shapeDifficulty } from '../engine/cost.ts';
import { getChord, getShapes } from '../shapes/library.ts';
import type { Shape } from '../shapes/types.ts';
import { lintAgainstStyle, type StyleIssue } from '../style/lint.ts';
import { PUSH_STEP } from '../style/riffBuilder.ts';
import type { RhythmStep } from '../../data/rhythms.ts';
import type { Piece, PieceEvent, PieceSection, StyleSheet } from '../style/types.ts';
import {
  checkBars,
  checkHarmony,
  checkPlayable,
  MAX_SHIFT_FRETS_PER_SEC,
  type Fingering,
  type Issue,
  type TabEvent,
} from '../tab/playability.ts';
import { chordName, chordTones, romanToChord, type ChordSpec } from '../theory/chord.ts';
import { parseNote } from '../theory/pitch.ts';
import { standard } from '../tuning.ts';
import type { BuiltLesson, Lesson } from './types.ts';

const STEPS_PER_BAR = 16;
const STRING_COUNT = 6;
const SECONDS_PER_MINUTE = 60;
const STEPS_PER_BEAT = 4;
const FOUR_FOUR = { top: 4, bottom: 4 };

export type LessonIssue = Issue | StyleIssue;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function lessonChords(lesson: Lesson, style: StyleSheet): string[] {
  const progression = lesson.progression;
  if ('chords' in progression) return progression.chords;
  const family = style.progressions.find((candidate) => candidate.id === progression.id);
  if (family === undefined) throw new Error(`${lesson.id}: unknown progression ${progression.id}`);
  const key = parseNote(progression.key);
  return family.roman.map((roman) => chordName(romanToChord(roman, key)));
}

export function candidateShapes(lesson: Lesson, chord: string): Shape[] {
  const { tags, register } = lesson.candidates;
  const byId = new Map<string, Shape>();
  for (const tag of tags) {
    const filter = register === undefined ? { tags: [tag] } : { tags: [tag], register };
    for (const shape of getShapes(chord, filter)) byId.set(shape.id, shape);
  }
  return [...byId.values()];
}

function optimiseChords(lesson: Lesson, chords: string[]) {
  const candidates = chords.map((chord) => {
    const shapes = candidateShapes(lesson, chord);
    if (shapes.length === 0) throw new Error(`${lesson.id}: no ${chord} shape for its candidates`);
    return shapes;
  });
  return optimise(candidates, { loop: true });
}

// Runs the optimiser over the lesson's chords (and any section overrides), keeping the first
// shape chosen for each chord name. Difficulty = transition cost + the shapes' own difficulty.
export function buildLesson(lesson: Lesson, style: StyleSheet): BuiltLesson {
  const chords = lessonChords(lesson, style);
  const main = optimiseChords(lesson, chords);
  const shapes: Record<string, string> = {};
  const record = (list: Shape[]) => {
    for (const shape of list) shapes[shape.chord] ??= shape.id;
  };
  record(main.shapes);
  for (const section of lesson.arrangement.sections) {
    if (section.chords !== undefined) record(optimiseChords(lesson, section.chords).shapes);
  }
  const ownCost = main.shapes.reduce((sum, shape) => sum + shapeDifficulty(shape), 0);
  return { ...lesson, chords, shapes, difficulty: round2(main.total + ownCost) };
}

function chordSpec(name: string): ChordSpec {
  const chord = getChord(name);
  if (chord === undefined) throw new Error(`Unknown chord ${name}`);
  return { root: chord.root, quality: chord.quality as ChordSpec['quality'] };
}

function shapeFor(lesson: BuiltLesson, chord: string): Shape {
  const shape = getShapes(chord).find((candidate) => candidate.id === lesson.shapes[chord]);
  if (shape === undefined) throw new Error(`${lesson.id}: no shape chosen for ${chord}`);
  return shape;
}

// Where the hand sits for a shape: the lowest (fret - finger + 1) of its fretted notes.
export function shapePosition(shape: Shape): number {
  const positions = shape.notes.flatMap((note) =>
    note.fret !== null && note.fret > 0 && typeof note.finger === 'number' && note.finger > 0
      ? [note.fret - note.finger + 1]
      : [],
  );
  return positions.length > 0 ? Math.min(...positions) : 0;
}

type Onset = {
  bar: number;
  step: RhythmStep;
  duration: number;
  chord: string;
  mutedForShift: boolean;
};

// Lays out every onset of a section, then turns the stroke before a shift that is too fast
// for the target tempo into a muted "throwaway" strum so the hand can leave early.
function sectionOnsets(
  lesson: BuiltLesson,
  steps: RhythmStep[],
  bars: number,
  chords: string[],
  push: boolean,
): Onset[] {
  const onsets: Onset[] = [];
  for (let bar = 0; bar < bars; bar++) {
    for (const [i, step] of steps.entries()) {
      const pushed = push && step.t === PUSH_STEP && bar + 1 < bars;
      const chord = chords[(bar + (pushed ? 1 : 0)) % chords.length] as string;
      const duration = (steps[i + 1]?.t ?? STEPS_PER_BAR) - step.t;
      onsets.push({ bar, step, duration, chord, mutedForShift: false });
    }
  }
  const secondsPerStep = SECONDS_PER_MINUTE / lesson.targetBpm / STEPS_PER_BEAT;
  onsets.forEach((onset, i) => {
    const next = onsets[i + 1];
    if (next === undefined || next.chord === onset.chord) return;
    const shift = Math.abs(
      shapePosition(shapeFor(lesson, next.chord)) - shapePosition(shapeFor(lesson, onset.chord)),
    );
    if (shift / (onset.duration * secondsPerStep) > MAX_SHIFT_FRETS_PER_SEC) {
      onset.mutedForShift = true;
    }
  });
  return onsets;
}

export type LessonRender = {
  piece: Piece;
  tab: TabEvent[];
  fingering: Fingering;
  onsets: TabEvent[];
  chordAt: ChordSpec[];
};

// Plays each section's rhythm cell over its chords with the chosen shapes, bar by bar.
export function renderLesson(lesson: BuiltLesson, style: StyleSheet): LessonRender {
  const push = style.mustInclude.some((rule) => rule.kind === 'push');
  const tab: TabEvent[] = [];
  const fingering: (0 | NonNullable<Fingering[number]>)[] = [];
  const onsets: TabEvent[] = [];
  const chordAt: ChordSpec[] = [];
  const sections: PieceSection[] = [];
  let barOffset = 0;

  for (const section of lesson.arrangement.sections) {
    const cell = style.rhythmCells.find((candidate) => candidate.id === section.rhythm);
    if (cell === undefined) throw new Error(`${lesson.id}: unknown rhythm ${section.rhythm}`);
    const chords = section.chords ?? lesson.chords;
    const events: PieceEvent[] = [];

    for (const onset of sectionOnsets(lesson, cell.steps, section.bars, chords, push)) {
      const { bar, step, duration } = onset;
      const chord = chordSpec(onset.chord);
      const muted = step.dir === 'mute' || onset.mutedForShift;
      const marks = [
        ...(section.marks ?? []),
        ...(step.accent === true ? (['accent'] as const) : []),
        ...(step.palmMute === true ? (['palm-mute'] as const) : []),
        ...(muted ? (['mute'] as const) : []),
      ];
      const notes = shapeFor(lesson, onset.chord).notes.flatMap((note, index) =>
        note.fret === null || !(step.strings?.includes(STRING_COUNT - index) ?? true)
          ? []
          : [
              {
                string: STRING_COUNT - index,
                fret: note.fret,
                finger: note.fret === 0 ? 0 : note.finger,
              },
            ],
      );
      for (const [n, note] of notes.entries()) {
        const event: TabEvent = {
          bar: barOffset + bar,
          time: (barOffset + bar) * STEPS_PER_BAR + step.t,
          duration,
          string: note.string,
          fret: note.fret,
          passing: muted,
        };
        tab.push(event);
        // A muted strum is not fretted, so it holds no hand position.
        fingering.push(muted ? 0 : (note.finger as NonNullable<typeof note.finger>));
        chordAt.push(chord);
        if (n === 0) onsets.push(event);
        events.push({
          bar: event.bar,
          t: step.t,
          duration,
          string: note.string,
          fret: note.fret,
          dir: muted ? 'mute' : step.dir,
          finger: note.finger,
          chord,
          articulations: [...marks],
        });
      }
    }
    sections.push({ name: section.name, events });
    barOffset += section.bars;
  }

  const piece: Piece = {
    id: lesson.id,
    kind: 'lesson',
    bpm: lesson.targetBpm,
    subdivision: style.feel.subdivision,
    swing: 50,
    tuning: lesson.tuning,
    capo: lesson.capo,
    sections,
  };
  return { piece, tab, fingering, onsets, chordAt };
}

// Shapes are written for standard tuning; the lesson's tuning and capo move every note together.
export function checkLesson(lesson: BuiltLesson, style: StyleSheet): LessonIssue[] {
  const { piece, tab, fingering, onsets, chordAt } = renderLesson(lesson, style);
  const harmonyIssues = tab.flatMap((event, i) => {
    const chord = chordAt[i] as ChordSpec;
    const tones = chordTones(chord).map((pc) => (pc - chord.root + 12) % 12);
    return checkHarmony([event], { root: chord.root, tones }, standard);
  });
  return [
    ...checkPlayable(tab, fingering, lesson.targetBpm),
    ...harmonyIssues,
    ...checkBars(onsets, FOUR_FOUR),
    ...lintAgainstStyle(piece, style),
  ];
}
