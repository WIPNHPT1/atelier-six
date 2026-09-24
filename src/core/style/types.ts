import type { RhythmStep } from '../../data/rhythms.ts';
import type { Finger } from '../shapes/types.ts';
import type { ChordSpec } from '../theory/chord.ts';

export type TuningId = 'standard' | 'halfDown' | 'dropD';

export type Articulation =
  | 'accent'
  | 'palm-mute'
  | 'let-ring'
  | 'ghost'
  | 'mute'
  | 'bend-half'
  | 'bend-full'
  | 'release'
  | 'vibrato'
  | 'slide'
  | 'hammer'
  | 'pull'
  | 'octave'
  | 'double-stop'
  | 'noise'
  | 'pedal'
  | 'killswitch'
  | 'sweep';

// "riff" rules must hold in every generated riff; "piece" rules only in a whole lesson or tune.
export type RuleScope = 'riff' | 'piece';

export type MustRule =
  | { kind: 'articulation'; value: Articulation; scope: RuleScope }
  | { kind: 'push'; scope: RuleScope }
  | { kind: 'palmMuteContrast'; scope: RuleScope }
  | { kind: 'accentOn'; steps: number[]; scope: RuleScope }
  | { kind: 'bothDirections'; scope: RuleScope }
  | { kind: 'phraseShape'; value: string; scope: RuleScope }
  | { kind: 'section'; value: string; scope: RuleScope };

export type AvoidRule =
  | { kind: 'articulation'; value: Articulation }
  | { kind: 'quality'; values: ChordSpec['quality'][] }
  | { kind: 'longSection'; section: string; maxBars: number }
  | { kind: 'drive' }
  | { kind: 'openChord' }
  | { kind: 'maxSimultaneous'; max: number }
  | { kind: 'downpickRun'; max: number }
  | { kind: 'fastRun'; max: number }
  | { kind: 'legatoRun'; max: number };

export type RhythmCell = { id: string; level: 1 | 2 | 3; steps: RhythmStep[] };
export type ProgressionFamily = { id: string; roman: string[] };
export type PhraseShape = { id: string; contour: number[] };

export type StyleSheet = {
  id: string;
  name: string;
  tempo: { min: number; max: number };
  feel: { subdivision: 8 | 16; maxSwing: number; downstrokesOnly: boolean };
  tunings: TuningId[];
  capo: { min: number; max: number };
  // "chord": riff notes are chord tones; "scale": notes come from `scale`, counted from the key.
  harmony: { line: 'chord' | 'scale'; scale: number[]; colours: string[] };
  strings: number[];
  structure: string[];
  mustInclude: MustRule[];
  avoid: AvoidRule[];
  rhythmCells: RhythmCell[];
  progressions: ProgressionFamily[];
  phraseShapes: PhraseShape[];
  articulations: Articulation[];
};

export type PieceEvent = {
  bar: number;
  t: number;
  duration: number;
  string: number;
  fret: number;
  dir?: RhythmStep['dir'];
  finger?: Finger | null;
  chord?: ChordSpec;
  articulations?: Articulation[];
  passing?: boolean;
};

export type PieceSection = { name: string; events: PieceEvent[] };

export type Piece = {
  id: string;
  kind: 'riff' | 'lesson' | 'tune';
  bpm: number;
  subdivision: 8 | 16;
  swing: number;
  tuning: TuningId;
  capo: number;
  drive?: boolean;
  phraseShape?: string;
  sections: PieceSection[];
};
