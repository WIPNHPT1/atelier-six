import * as Tone from 'tone';
import { buildSchedule, type ScheduleEvent } from '../core/schedule/buildSchedule.ts';
import { humanise } from '../core/schedule/humanise.ts';
import { standard } from '../core/tuning.ts';
import { getChord, getShapes } from '../core/shapes/library.ts';
import type { Shape } from '../core/shapes/types.ts';
import { RHYTHMS } from '../data/rhythms.ts';
import { useSettingsStore } from '../app/settingsStore.ts';
import { ensureAudio, playDrum, playEvent, type GuitarTone } from './engine.ts';
import type { DrumName } from './samples.ts';

const CHORD_BPM = 96;
const PUNK_BPM = 176;
const DEMO_SEED = 6;
const EIGHTH_SECONDS = 30 / PUNK_BPM;
const LOW_E = 0;
const A_STRING = 1;

function maybeHumanise(schedule: ScheduleEvent[]): ScheduleEvent[] {
  return useSettingsStore.getState().robotMode ? schedule : humanise(schedule, { seed: DEMO_SEED });
}

function playSchedule(schedule: ScheduleEvent[], tone: GuitarTone = 'clean'): void {
  const start = Tone.now();
  maybeHumanise(schedule).forEach((event) => {
    playEvent(event, start + event.t, tone);
  });
}

// Root, fifth and octave on adjacent strings, root on the given string (0 = low E).
function rootPowerChord(name: string, rootString: number): Shape | undefined {
  return getShapes(name, { tags: ['power'] }).find((shape) =>
    shape.notes.every((note, i) =>
      i >= rootString && i < rootString + 3 ? note.fret !== null : note.fret === null,
    ),
  );
}

export async function playStrummedChordDemo(): Promise<void> {
  await ensureAudio();
  const shape = getChord('C')?.shapes[0];
  const rhythm = RHYTHMS.find((r) => r.id === 'pop-strum');
  if (!shape || !rhythm) return;
  playSchedule(
    buildSchedule({ shapes: [shape], rhythm, bpm: CHORD_BPM, bars: [1], tuning: standard }),
  );
}

export async function playPalmMutedRiffDemo(): Promise<void> {
  await ensureAudio();
  const shapes = [
    rootPowerChord('E5', LOW_E),
    rootPowerChord('G5', LOW_E),
    rootPowerChord('A5', LOW_E),
    rootPowerChord('C5', A_STRING),
  ].filter((shape): shape is Shape => shape !== undefined);
  const rhythm = RHYTHMS.find((r) => r.id === 'driving-eighths');
  if (shapes.length === 0 || !rhythm) return;
  playSchedule(
    buildSchedule({
      shapes,
      rhythm,
      bpm: PUNK_BPM,
      bars: shapes.map(() => 1),
      tuning: standard,
    }),
    'driven',
  );
}

type DrumHit = [eighth: number, drum: DrumName, velocity: number];

// Two bars of a straight-eighths punk beat: hats on every eighth (downbeats
// louder), kick on 1, the "and" of 2 and 3, snare backbeat on 2 and 4, a crash
// to open, an open hat pushing into the final crash.
const PUNK_BEAT: DrumHit[] = [
  [0, 'crash', 0.95],
  [0, 'kick', 1],
  [1, 'hihatClosed', 0.55],
  [2, 'hihatClosed', 0.8],
  [2, 'snare', 0.95],
  [3, 'hihatClosed', 0.55],
  [3, 'kick', 0.85],
  [4, 'hihatClosed', 0.8],
  [4, 'kick', 0.95],
  [5, 'hihatClosed', 0.55],
  [6, 'hihatClosed', 0.8],
  [6, 'snare', 1],
  [7, 'hihatClosed', 0.55],
  [8, 'hihatClosed', 0.8],
  [8, 'kick', 1],
  [9, 'hihatClosed', 0.55],
  [10, 'hihatClosed', 0.8],
  [10, 'snare', 0.95],
  [11, 'hihatClosed', 0.55],
  [11, 'kick', 0.85],
  [12, 'hihatClosed', 0.8],
  [12, 'kick', 0.95],
  [13, 'hihatClosed', 0.55],
  [14, 'snare', 1],
  [14, 'hihatClosed', 0.8],
  [15, 'hihatOpen', 0.75],
  [15, 'kick', 0.85],
  [16, 'crash', 1],
  [16, 'kick', 1],
];

export async function playDrumGrooveDemo(): Promise<void> {
  await ensureAudio();
  const start = Tone.now();
  PUNK_BEAT.forEach(([eighth, drum, velocity]) => {
    playDrum(drum, start + eighth * EIGHTH_SECONDS, velocity);
  });
}
