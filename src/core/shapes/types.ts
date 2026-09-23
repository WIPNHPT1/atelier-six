import type { PitchClass } from '../theory/pitch.ts';

export type Finger = 0 | 1 | 2 | 3 | 4 | 'T';

export type StringNote = {
  fret: number | null;
  finger: Finger | null;
};

export type Shape = {
  id: string;
  chord: string;
  notes: [StringNote, StringNote, StringNote, StringNote, StringNote, StringNote];
  register: 'low' | 'mid' | 'high';
  tags: string[];
  barre?: { fret: number; from: number; to: number; finger: 1 };
};

export type Chord = {
  name: string;
  root: PitchClass;
  quality: string;
  shapes: Shape[];
};
