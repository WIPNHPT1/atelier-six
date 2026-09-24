import * as Tone from 'tone';
import type { RhythmPreset } from '../data/rhythms.ts';
import { buildSchedule } from '../core/schedule/buildSchedule.ts';
import { standard } from '../core/tuning.ts';
import type { Shape } from '../core/shapes/types.ts';
import { ensureAudio, playEvent } from './engine.ts';

const HEAR_CHORD_BPM = 90;

const STRUM_ONCE: RhythmPreset = {
  id: 'hear-chord',
  subdivision: 8,
  steps: [{ t: 0, dir: 'D' }],
};

export async function hearChord(shape: Shape): Promise<void> {
  await ensureAudio();
  const [event] = buildSchedule({
    shapes: [shape],
    rhythm: STRUM_ONCE,
    bpm: HEAR_CHORD_BPM,
    bars: [1],
    tuning: standard,
  });
  if (event) playEvent(event, Tone.now());
}
