import type { Shape } from '../shapes/types.ts';
import type { Articulation, Piece, TuningId } from '../style/types.ts';

export type LessonModule = 'power' | 'open';

export type SectionName = 'intro' | 'verse' | 'pre' | 'chorus' | 'bridge' | 'breakdown';

export type Layer = {
  id: string;
  role: 'rhythm' | 'double' | 'contrast' | 'riff';
  pan: number;
  voicing: Shape['register'];
  muted: boolean;
};

export type ArrangementSection = {
  name: SectionName;
  register: Shape['register'];
  // Id of a rhythm cell in the lesson's style sheet.
  rhythm: string;
  layers: Layer[];
  dynamics: number;
  bars: number;
  // Overrides the lesson's chords for this section (e.g. a breakdown hit).
  chords?: string[];
  marks?: Articulation[];
};

export type Arrangement = { sections: ArrangementSection[] };

export type ListenRef = { artist: string; song: string; note: string };

export type LessonProgression = { id: string; key: string } | { chords: string[] };

export type Lesson = {
  id: string;
  module: LessonModule;
  title: string;
  goal: string;
  progression: LessonProgression;
  // A shape qualifies if it carries any of the tags.
  candidates: { tags: string[]; register?: Shape['register'] };
  arrangement: Arrangement;
  startBpm: number;
  targetBpm: number;
  tuning: TuningId;
  capo: number;
  tips: string[];
  listen: ListenRef[];
  // The easier part adaptive tempo switches to: each section rhythm → a sparser one.
  easier?: { rhythms: Record<string, string> };
};

// What `npm run data:lessons` writes: the source lesson plus the optimiser's choices.
export type BuiltLesson = Lesson & {
  chords: string[];
  shapes: Record<string, string>;
  difficulty: number;
};

// A short original riff for a module, unlocked once the given lesson number is done.
export type RiffSource = {
  id: string;
  module: LessonModule;
  title: string;
  unlockAfter: number;
  key: string;
  bars: number;
  seed: number;
  difficulty: 1 | 2 | 3;
};

export type BuiltRiff = Omit<RiffSource, 'key' | 'seed' | 'difficulty'> & { piece: Piece };

export type TunesData = { tunes: BuiltLesson[]; riffs: BuiltRiff[] };
