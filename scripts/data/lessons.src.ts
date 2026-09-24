// Source for `npm run data:lessons`. Techniques, shapes and generic progressions only:
// no tab or lyrics of real songs. Artists and songs appear only as listening references.
import type {
  Arrangement,
  ArrangementSection,
  Layer,
  Lesson,
  ListenRef,
} from '../../src/core/lessons/types.ts';

const RHYTHM_LAYER: Layer = { id: 'rhythm', role: 'rhythm', pan: 0, voicing: 'low', muted: false };
const HIGH_LAYER: Layer = { id: 'layer', role: 'double', pan: 0.3, voicing: 'high', muted: false };

function section(
  name: ArrangementSection['name'],
  rhythm: string,
  bars: number,
  dynamics: number,
  extra: Partial<ArrangementSection> = {},
): ArrangementSection {
  return { name, register: 'low', rhythm, layers: [RHYTHM_LAYER], dynamics, bars, ...extra };
}

// Pop punk preset: octave intro, palm-muted verse, open chorus, stop-time turnaround.
function punk(opts: { verse?: string; chorus?: string; breakdown?: string[] } = {}): Arrangement {
  return {
    sections: [
      section('intro', 'eighths-open', 4, 0.8, { marks: ['octave'] }),
      section('verse', opts.verse ?? 'eighths-muted', 4, 0.7),
      section('chorus', opts.chorus ?? 'eighths-open', 4, 1),
      section('breakdown', 'stop-push', 2, 0.9, opts.breakdown ? { chords: opts.breakdown } : {}),
    ],
  };
}

// Britpop preset: strummed intro, verse, pre-chorus lift, big ringing chorus.
function britpop(opts: { rhythm?: string; chorus?: string; layered?: boolean } = {}): Arrangement {
  const rhythm = opts.rhythm ?? 'sixteenth-strum';
  const layers = opts.layered === true ? [RHYTHM_LAYER, HIGH_LAYER] : [RHYTHM_LAYER];
  return {
    sections: [
      section('intro', rhythm, 2, 0.7),
      section('verse', rhythm, 4, 0.7),
      section('pre', 'push-strum', 2, 0.85),
      section('chorus', opts.chorus ?? 'push-strum', 4, 1, { marks: ['let-ring'], layers }),
    ],
  };
}

const SMALL_THINGS: ListenRef = {
  artist: 'Blink-182',
  song: 'All the Small Things',
  note: 'Simple power chords, steady downstroked eighths and a big lift into the chorus.',
};
const AGE_AGAIN: ListenRef = {
  artist: 'Blink-182',
  song: "What's My Age Again?",
  note: 'Tight palm-muted verses against an open, driving chorus.',
};
const OKAY: ListenRef = {
  artist: 'Machine Gun Kelly',
  song: "I Think I'm OKAY",
  note: 'Modern pop punk: bright power chords pushed ahead of the beat.',
};
const WONDERWALL: ListenRef = {
  artist: 'Oasis',
  song: 'Wonderwall',
  note: 'Capo on, anchored shapes and top strings ringing through every change.',
};
const DONT_LOOK_BACK: ListenRef = {
  artist: 'Oasis',
  song: "Don't Look Back in Anger",
  note: 'Open chords strummed wide with a chorus that keeps building.',
};
const LIVE_FOREVER: ListenRef = {
  artist: 'Oasis',
  song: 'Live Forever',
  note: 'A steady strumming arm under ringing open chords.',
};

// Adaptive tempo's easier part: the same sections with fewer strokes.
const POWER_EASIER = {
  rhythms: {
    'eighths-muted': 'quarter-push-muted',
    'eighths-open': 'quarter-push-open',
    'quarter-and': 'quarter-push-open',
  },
};
const OPEN_EASIER = {
  rhythms: {
    'sixteenth-strum': 'eighth-strum',
    'push-strum': 'eighth-strum',
    'full-motion': 'sixteenth-strum',
  },
};

const POWER = { tags: ['power'] };
const OPEN = { tags: ['open', 'anchored'] };

export const LESSONS: Lesson[] = [
  {
    id: 'power-e5-a5',
    module: 'power',
    easier: POWER_EASIER,
    title: 'E5 to A5, open strings',
    goal: 'Move a two-finger power chord across one string without losing the beat.',
    progression: { chords: ['E5', 'A5'] },
    candidates: POWER,
    arrangement: punk(),
    startBpm: 100,
    targetBpm: 160,
    tuning: 'standard',
    capo: 0,
    tips: [
      'Let the open string do the work; only the fretted fingers move.',
      'Downstrokes only, from the elbow, not the wrist.',
    ],
    listen: [SMALL_THINGS],
  },
  {
    id: 'power-g5-a5',
    module: 'power',
    easier: POWER_EASIER,
    title: 'G5 to A5, locked shape',
    goal: 'Slide one locked power-chord shape up two frets and land in time.',
    progression: { chords: ['G5', 'A5'] },
    candidates: POWER,
    arrangement: punk(),
    startBpm: 100,
    targetBpm: 160,
    tuning: 'standard',
    capo: 0,
    tips: ['Keep the shape locked; ease pressure as you slide, press as you land.'],
    listen: [OKAY],
  },
  {
    id: 'power-g5-c5',
    module: 'power',
    easier: POWER_EASIER,
    title: 'G5 to C5, string shift',
    goal: 'Hop the same shape from the low E string to the A string.',
    progression: { chords: ['G5', 'C5'] },
    candidates: POWER,
    arrangement: punk(),
    startBpm: 100,
    targetBpm: 160,
    tuning: 'standard',
    capo: 0,
    tips: ['Release pressure between chords; a light hand moves faster.'],
    listen: [AGE_AGAIN],
  },
  {
    id: 'power-i-v-vi-iv-c',
    module: 'power',
    easier: POWER_EASIER,
    title: 'I–V–vi–IV in C',
    goal: 'Play the four-chord loop as power chords with every change on time.',
    progression: { id: 'I5-V5-vi5-IV5', key: 'C' },
    candidates: POWER,
    arrangement: punk(),
    startBpm: 100,
    targetBpm: 160,
    tuning: 'standard',
    capo: 0,
    tips: ['Look one chord ahead; start moving on the last eighth.'],
    listen: [SMALL_THINGS],
  },
  {
    id: 'power-vi-iv-i-v-d',
    module: 'power',
    easier: POWER_EASIER,
    title: 'vi–IV–I–V in D',
    goal: 'Start the loop on the minor chord and keep the drive going.',
    progression: { id: 'vi5-IV5-I5-V5', key: 'D' },
    candidates: POWER,
    arrangement: punk(),
    startBpm: 100,
    targetBpm: 160,
    tuning: 'standard',
    capo: 0,
    tips: ['Same four chords, new starting point: count the loop out loud once.'],
    listen: [OKAY],
  },
  {
    id: 'power-stamina',
    module: 'power',
    easier: POWER_EASIER,
    title: 'Downpicking stamina',
    goal: 'Hold even downstroked eighths on one chord as the tempo climbs.',
    progression: { chords: ['E5'] },
    candidates: POWER,
    arrangement: punk({ breakdown: ['E5', 'A5'] }),
    startBpm: 110,
    targetBpm: 180,
    tuning: 'standard',
    capo: 0,
    tips: [
      'Small, relaxed strokes; tension is what tires the arm.',
      'Rest the palm lightly by the bridge for the muted verse.',
    ],
    listen: [AGE_AGAIN],
  },
  {
    id: 'power-verse-chorus',
    module: 'power',
    easier: POWER_EASIER,
    title: 'Verse and chorus',
    goal: 'Switch from palm-muted verse eighths to an open chorus, then stop on the turnaround.',
    progression: { id: 'I5-IV5-V5-IV5', key: 'A' },
    candidates: POWER,
    arrangement: punk({ chorus: 'quarter-and' }),
    startBpm: 100,
    targetBpm: 170,
    tuning: 'standard',
    capo: 0,
    tips: [
      'Lift the palm off for the chorus and let it ring loud.',
      'Stops are part of the groove: mute with the fretting hand.',
    ],
    listen: [AGE_AGAIN],
  },
  {
    id: 'power-octave-intro',
    module: 'power',
    easier: POWER_EASIER,
    title: 'Octave-shape intro',
    goal: 'Play the loop as octave shapes for a riff-style intro.',
    progression: { id: 'I5-IV5-V5-IV5', key: 'A' },
    candidates: { tags: ['octave'] },
    arrangement: punk(),
    startBpm: 100,
    targetBpm: 160,
    tuning: 'standard',
    capo: 0,
    tips: ['Let the first finger touch the string between the two notes to mute it.'],
    listen: [SMALL_THINGS],
  },
  {
    id: 'open-c-am',
    module: 'open',
    easier: OPEN_EASIER,
    title: 'C to Am, anchored',
    goal: 'Change between C and Am while two fingers stay put.',
    progression: { chords: ['C', 'Am'] },
    candidates: OPEN,
    arrangement: britpop(),
    startBpm: 60,
    targetBpm: 90,
    tuning: 'standard',
    capo: 0,
    tips: ['Only one finger moves; leave the others pressed.'],
    listen: [DONT_LOOK_BACK],
  },
  {
    id: 'open-em-am',
    module: 'open',
    easier: OPEN_EASIER,
    title: 'Em to Am, one string over',
    goal: 'Shift the Em shape across one string to make Am.',
    progression: { chords: ['Em', 'Am'] },
    candidates: OPEN,
    arrangement: britpop(),
    startBpm: 60,
    targetBpm: 90,
    tuning: 'standard',
    capo: 0,
    tips: ['Move the pair of fingers as one unit.'],
    listen: [LIVE_FOREVER],
  },
  {
    id: 'open-g-c',
    module: 'open',
    easier: OPEN_EASIER,
    title: 'G (3-2-4) to C',
    goal: 'Use the 3-2-4 G fingering so the change to C is a short hop.',
    progression: { chords: ['G', 'C'] },
    candidates: OPEN,
    arrangement: britpop(),
    startBpm: 60,
    targetBpm: 90,
    tuning: 'standard',
    capo: 0,
    tips: ['Fingers two and three move together as a pair.'],
    listen: [DONT_LOOK_BACK],
  },
  {
    id: 'open-anchored-loop',
    module: 'open',
    easier: OPEN_EASIER,
    title: 'Em7, G, Dsus4, A7sus4',
    goal: 'Loop four anchored shapes with the top strings ringing throughout.',
    progression: { chords: ['Em7', 'G', 'Dsus4', 'A7sus4'] },
    candidates: { tags: ['anchored'] },
    arrangement: britpop(),
    startBpm: 60,
    targetBpm: 90,
    tuning: 'standard',
    capo: 0,
    tips: ['Fingers three and four never leave the top strings.'],
    listen: [WONDERWALL],
  },
  {
    id: 'open-cadd9',
    module: 'open',
    easier: OPEN_EASIER,
    title: 'Cadd9 and friends',
    goal: 'Play G, Cadd9, Em7 and Dsus4 around the same anchor.',
    progression: { chords: ['G', 'Cadd9', 'Em7', 'Dsus4'] },
    candidates: { tags: ['anchored'] },
    arrangement: britpop(),
    startBpm: 60,
    targetBpm: 90,
    tuning: 'standard',
    capo: 0,
    tips: ['Keep the anchor fingers down; only the bass fingers travel.'],
    listen: [WONDERWALL],
  },
  {
    id: 'open-sixteenth-motion',
    module: 'open',
    easier: OPEN_EASIER,
    title: 'Continuous sixteenth strum',
    goal: 'Keep the strumming arm moving down and up on every sixteenth.',
    progression: { id: 'I-IV-vi-V', key: 'G' },
    candidates: OPEN,
    arrangement: britpop({ rhythm: 'full-motion', chorus: 'full-motion' }),
    startBpm: 60,
    targetBpm: 95,
    tuning: 'standard',
    capo: 0,
    tips: ['The arm never stops; you choose which strokes touch the strings.'],
    listen: [LIVE_FOREVER],
  },
  {
    id: 'open-capo-2',
    module: 'open',
    easier: OPEN_EASIER,
    title: 'Capo 2 arrangement',
    goal: 'Strum the loop with a capo and add a second part on higher voicings.',
    progression: { id: 'vi-IV-I-V', key: 'G' },
    candidates: OPEN,
    arrangement: britpop({ layered: true }),
    startBpm: 65,
    targetBpm: 95,
    tuning: 'standard',
    capo: 2,
    tips: ['Shapes stay the same with the capo; the frets are counted from it.'],
    listen: [WONDERWALL],
  },
  {
    id: 'open-i-v-vi-iv-g',
    module: 'open',
    easier: OPEN_EASIER,
    title: 'I–V–vi–IV in G',
    goal: 'Play the four-chord loop with open shapes and a big chorus.',
    progression: { id: 'I-V-vi-IV', key: 'G' },
    candidates: OPEN,
    arrangement: britpop(),
    startBpm: 60,
    targetBpm: 95,
    tuning: 'standard',
    capo: 0,
    tips: ['Keep the strumming arm moving through every change.'],
    listen: [DONT_LOOK_BACK],
  },
];
