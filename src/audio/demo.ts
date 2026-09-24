import * as Tone from 'tone';
import { buildSchedule, type ScheduleEvent } from '../core/schedule/buildSchedule.ts';
import { humanise } from '../core/schedule/humanise.ts';
import { standard } from '../core/tuning.ts';
import { getChord, getShapes } from '../core/shapes/library.ts';
import { RHYTHMS } from '../data/rhythms.ts';
import { useSettingsStore } from '../app/settingsStore.ts';
import { ensureAudio, playBassNote, playDrum, playEvent } from './engine.ts';

const DEMO_BPM = 96;
const DEMO_SEED = 6;
const SIXTEENTH_SECONDS = 15 / DEMO_BPM;
const BEAT_SECONDS = SIXTEENTH_SECONDS * 4;
const BASS_ROOT_MIDI = 40; // E2
const BASS_FIFTH_MIDI = 47; // B2

function maybeHumanise(schedule: ScheduleEvent[]): ScheduleEvent[] {
  return useSettingsStore.getState().robotMode ? schedule : humanise(schedule, { seed: DEMO_SEED });
}

function playSchedule(schedule: ScheduleEvent[]): void {
  const start = Tone.now();
  maybeHumanise(schedule).forEach((event) => {
    playEvent(event, start + event.t);
  });
}

export async function playStrummedChordDemo(): Promise<void> {
  await ensureAudio();
  const shape = getChord('C')?.shapes[0];
  const rhythm = RHYTHMS.find((r) => r.id === 'pop-strum');
  if (!shape || !rhythm) return;
  playSchedule(
    buildSchedule({ shapes: [shape], rhythm, bpm: DEMO_BPM, bars: [1], tuning: standard }),
  );
}

export async function playPalmMutedRiffDemo(): Promise<void> {
  await ensureAudio();
  const shape = getShapes('G5', { tags: ['power'] })[0];
  const rhythm = RHYTHMS.find((r) => r.id === 'driving-eighths');
  if (!shape || !rhythm) return;
  playSchedule(
    buildSchedule({ shapes: [shape], rhythm, bpm: DEMO_BPM, bars: [2], tuning: standard }),
  );
}

export async function playDrumGrooveDemo(): Promise<void> {
  await ensureAudio();
  const start = Tone.now();
  const plays: (() => void)[] = [
    () => {
      playDrum('kick', start);
    },
    () => {
      playBassNote(BASS_ROOT_MIDI, start, BEAT_SECONDS);
    },
    () => {
      playDrum('hihatClosed', start + BEAT_SECONDS * 0.5);
    },
    () => {
      playDrum('snare', start + BEAT_SECONDS);
    },
    () => {
      playDrum('hihatClosed', start + BEAT_SECONDS * 1.5);
    },
    () => {
      playDrum('kick', start + BEAT_SECONDS * 2);
    },
    () => {
      playBassNote(BASS_FIFTH_MIDI, start + BEAT_SECONDS * 2, BEAT_SECONDS);
    },
    () => {
      playDrum('hihatOpen', start + BEAT_SECONDS * 2.5);
    },
    () => {
      playDrum('snare', start + BEAT_SECONDS * 3);
    },
    () => {
      playDrum('hihatClosed', start + BEAT_SECONDS * 3.5);
    },
  ];
  plays.forEach((play) => {
    play();
  });
}
