export type RhythmStep = {
  t: number;
  dir: 'D' | 'U' | 'mute' | 'pick';
  strings?: number[];
  accent?: boolean;
  palmMute?: boolean;
  ghost?: boolean;
};

export type RhythmPreset = {
  id: string;
  steps: RhythmStep[];
  subdivision: 8 | 16;
};

const drivingEighths: RhythmPreset = {
  id: 'driving-eighths',
  subdivision: 8,
  steps: Array.from({ length: 8 }, (_, t) => ({ t, dir: 'D', palmMute: true })),
};

const popStrum: RhythmPreset = {
  id: 'pop-strum',
  subdivision: 8,
  steps: [
    { t: 0, dir: 'D' },
    { t: 2, dir: 'D' },
    { t: 3, dir: 'U' },
    { t: 5, dir: 'U' },
    { t: 6, dir: 'D' },
    { t: 7, dir: 'U' },
  ],
};

const SOUNDING_SIXTEENTH_STEPS = new Set([0, 2, 3, 6, 8, 10, 11, 14]);

const sixteenthMotion: RhythmPreset = {
  id: 'sixteenth-motion',
  subdivision: 16,
  steps: Array.from({ length: 16 }, (_, t) => {
    const step: RhythmStep = { t, dir: t % 2 === 0 ? 'D' : 'U' };
    if (!SOUNDING_SIXTEENTH_STEPS.has(t)) step.ghost = true;
    return step;
  }),
};

// Root -> 5th -> 3rd -> octave on generic open-position strings, one pick every quarter note.
const arpeggio: RhythmPreset = {
  id: 'arpeggio',
  subdivision: 8,
  steps: [
    { t: 0, dir: 'pick', strings: [4] },
    { t: 2, dir: 'pick', strings: [3] },
    { t: 4, dir: 'pick', strings: [2] },
    { t: 6, dir: 'pick', strings: [1] },
  ],
};

const stops: RhythmPreset = {
  id: 'stops',
  subdivision: 8,
  steps: [
    { t: 0, dir: 'D', accent: true },
    { t: 3, dir: 'D', accent: true },
  ],
};

const wholeNotes: RhythmPreset = {
  id: 'whole-notes',
  subdivision: 8,
  steps: [{ t: 0, dir: 'D' }],
};

export const RHYTHMS: RhythmPreset[] = [
  drivingEighths,
  popStrum,
  sixteenthMotion,
  arpeggio,
  stops,
  wholeNotes,
];
