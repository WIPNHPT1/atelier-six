// Source for the module tunes and riffs of the week (built by `npm run data:lessons`).
// Original music in each module's style, made from its style sheet's cells and progressions.
import type {
  ArrangementSection,
  Layer,
  Lesson,
  RiffSource,
} from '../../src/core/lessons/types.ts';

const RHYTHM: Layer = { id: 'rhythm', role: 'rhythm', pan: 0, voicing: 'low', muted: false };
const DOUBLE: Layer = { id: 'layer', role: 'double', pan: 0.3, voicing: 'high', muted: false };

function section(
  name: ArrangementSection['name'],
  rhythm: string,
  bars: number,
  dynamics: number,
  chords: string[],
  extra: Partial<ArrangementSection> = {},
): ArrangementSection {
  return { name, register: 'low', rhythm, layers: [RHYTHM], dynamics, bars, chords, ...extra };
}

// Pop punk in E: riff intro → palm-muted verse → build → open chorus → stop-time breakdown →
// double chorus. 88 bars at 170 bpm ≈ 2:04.
const CHORUS_E = ['E5', 'B5', 'C#5', 'A5'];
const VERSE_E = ['C#5', 'A5', 'E5', 'B5'];

const SODIUM: Lesson = {
  id: 'tune-power',
  module: 'power',
  title: 'Sodium Streetlights',
  goal: 'Play the whole tune with the band, from the octave intro to the last double chorus.',
  progression: { id: 'I5-V5-vi5-IV5', key: 'E' },
  candidates: { tags: ['power'] },
  arrangement: {
    sections: [
      section('intro', 'eighths-open', 8, 0.8, CHORUS_E, { marks: ['octave'] }),
      section('verse', 'eighths-muted', 16, 0.7, VERSE_E),
      section('pre', 'quarter-and', 8, 0.85, ['A5', 'B5']),
      section('chorus', 'eighths-open', 16, 1, CHORUS_E),
      section('breakdown', 'stop-push', 8, 0.9, ['E5', 'B5']),
      section('chorus', 'eighths-open', 16, 1, CHORUS_E),
      section('chorus', 'eighths-open', 16, 1, CHORUS_E),
    ],
  },
  startBpm: 130,
  targetBpm: 170,
  tuning: 'standard',
  capo: 0,
  tips: [
    'Palm down for the verse, palm off for the chorus: that contrast is the song.',
    'In the breakdown, let the silences ring as loud as the hits.',
  ],
  listen: [],
};

// Britpop in G: long strummed intro → verse → pre-chorus → big layered chorus, twice.
// 52 bars at 86 bpm ≈ 2:25.
const CHORUS_G = ['G', 'D', 'Em', 'C'];
const VERSE_G = ['Em', 'C', 'G', 'D'];

const TERRACE: Lesson = {
  id: 'tune-open',
  module: 'open',
  title: 'Terrace Weather',
  goal: 'Keep the strumming arm moving through the whole tune while the band builds.',
  progression: { id: 'I-V-vi-IV', key: 'G' },
  candidates: { tags: ['open', 'anchored'] },
  arrangement: {
    sections: [
      section('intro', 'sixteenth-strum', 4, 0.7, ['G', 'Cadd9', 'Em7', 'Dsus4']),
      section('verse', 'sixteenth-strum', 8, 0.7, VERSE_G),
      section('pre', 'push-strum', 4, 0.85, ['C', 'D']),
      section('chorus', 'push-strum', 8, 1, CHORUS_G, {
        marks: ['let-ring'],
        layers: [RHYTHM, DOUBLE],
      }),
      section('verse', 'sixteenth-strum', 8, 0.75, VERSE_G),
      section('pre', 'push-strum', 4, 0.85, ['C', 'D']),
      section('chorus', 'push-strum', 8, 1, CHORUS_G, {
        marks: ['let-ring'],
        layers: [RHYTHM, DOUBLE],
      }),
      section('chorus', 'full-motion', 8, 1, CHORUS_G, {
        marks: ['let-ring'],
        layers: [RHYTHM, DOUBLE],
      }),
    ],
  },
  startBpm: 70,
  targetBpm: 86,
  tuning: 'standard',
  capo: 0,
  tips: [
    'Let the top strings ring through every change.',
    'The last chorus goes to full sixteenths: lighter hand, same arm.',
  ],
  listen: [],
};

export const TUNES: Lesson[] = [SODIUM, TERRACE];

export const RIFFS: RiffSource[] = [
  {
    id: 'riff-power-1',
    module: 'power',
    title: 'Night Bus Home',
    unlockAfter: 3,
    key: 'E',
    bars: 4,
    seed: 11,
    difficulty: 1,
  },
  {
    id: 'riff-power-2',
    module: 'power',
    title: 'Carpark Anthem',
    unlockAfter: 6,
    key: 'A',
    bars: 8,
    seed: 23,
    difficulty: 2,
  },
  {
    id: 'riff-open-1',
    module: 'open',
    title: 'Pier in November',
    unlockAfter: 3,
    key: 'G',
    bars: 4,
    seed: 7,
    difficulty: 1,
  },
  {
    id: 'riff-open-2',
    module: 'open',
    title: 'Borrowed Umbrella',
    unlockAfter: 6,
    key: 'D',
    bars: 8,
    seed: 31,
    difficulty: 2,
  },
];
