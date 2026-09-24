import * as Tone from 'tone';
import {
  buildSchedule,
  stepDurSeconds,
  type ScheduleEvent,
  type ScheduleInput,
} from '../core/schedule/buildSchedule.ts';
import { humanise } from '../core/schedule/humanise.ts';
import { applyFreezes } from '../core/drills/drills.ts';
import { resumePosition } from '../core/schedule/tempoChange.ts';
import { useSettingsStore } from '../app/settingsStore.ts';
import type { BandEvent } from '../core/band/band.ts';
import { forgetRinging, playBand, playEvent } from './engine.ts';

const HUMANISE_SEED = 6;
const SIXTEENTHS_PER_BAR = 16;

// A loop lasts its whole bars (plus any freezes), not just up to its last strum.
function loopSecondsFor(source: ScheduleSource, bpm: number): number {
  const bars = source.bars.reduce((sum, count) => sum + count, 0);
  const base = bars * SIXTEENTHS_PER_BAR * stepDurSeconds(bpm);
  if (source.freezeSeconds === undefined) return base;
  const plain = buildSchedule({ ...source, bpm, countIn: false });
  return (
    base + applyFreezes(plain, bpm, source.freezeSeconds).windows.length * source.freezeSeconds
  );
}

function scheduleFor(source: ScheduleSource, bpm: number): ScheduleEvent[] {
  const events = buildSchedule({ ...source, bpm });
  if (source.freezeSeconds === undefined) return withHumanise(events);
  return withHumanise(applyFreezes(events, bpm, source.freezeSeconds).events);
}

function withHumanise(schedule: ScheduleEvent[]): ScheduleEvent[] {
  if (useSettingsStore.getState().robotMode) return schedule;
  return humanise(schedule, { seed: HUMANISE_SEED });
}

// freezeSeconds: pause on each chord's first strum (freeze-and-check drill).
export type ScheduleSource = Omit<ScheduleInput, 'bpm'> & { freezeSeconds?: number };
// An extra arrangement layer, mixed in with its own pan.
export type LayerSource = { source: ScheduleSource; pan: number };

type PlayOptions = { loop?: boolean; layers?: LayerSource[] };

let part: Tone.Part<[number, ScheduleEvent]> | null = null;
let layerParts: Tone.Part<[number, ScheduleEvent]>[] = [];
let currentLayers: LayerSource[] = [];
let currentSource: ScheduleSource | null = null;
let currentSchedule: ScheduleEvent[] | null = null;
let currentBpm = 120;
let currentLoop = false;
let currentLoopSeconds = 0;
let currentEndSeconds: number | null = null;
let bandPart: Tone.Part<[number, BandEvent]> | null = null;

// When a one-shot (non-looping) performance ends, in transport seconds.
export function getEndSeconds(): number | null {
  return currentLoop ? null : currentEndSeconds;
}

// A whole arrangement built up front (all sections, optional band).
export type PreparedPlay = { events: ScheduleEvent[]; band?: BandEvent[]; totalSeconds: number };

function disposeBand(): void {
  bandPart?.dispose();
  bandPart = null;
}

// Length of one pass when looping, so the playhead can wrap with the audio.
export function getLoopSeconds(): number | null {
  return currentLoop && currentLoopSeconds > 0 ? currentLoopSeconds : null;
}

export function getSchedule(): ScheduleEvent[] | null {
  return currentSchedule;
}

export function getBpm(): number {
  return currentBpm;
}

function newPart(schedule: ScheduleEvent[], loop: boolean, pan: number) {
  const created = new Tone.Part<[number, ScheduleEvent]>(
    (time, event) => {
      playEvent(event, time, 'clean', pan);
    },
    schedule.map((event) => [event.t, event] as [number, ScheduleEvent]),
  );
  created.loop = loop;
  if (loop) created.loopEnd = currentLoopSeconds;
  created.start(0);
  return created;
}

function disposeLayers(): void {
  for (const layerPart of layerParts) layerPart.dispose();
  layerParts = [];
}

function schedulePart(schedule: ScheduleEvent[], loop: boolean): void {
  part?.dispose();
  currentSchedule = schedule;
  part = newPart(schedule, loop, 0);
}

function scheduleLayers(bpm: number, loop: boolean): void {
  disposeLayers();
  layerParts = currentLayers.map((layer) =>
    newPart(scheduleFor(layer.source, bpm), loop, layer.pan),
  );
}

export function play(source: ScheduleSource, bpm: number, opts: PlayOptions = {}): void {
  const transport = Tone.getTransport();
  transport.stop();
  transport.cancel();
  transport.seconds = 0;
  transport.bpm.value = bpm;

  currentSource = source;
  currentBpm = bpm;
  currentLoop = opts.loop ?? false;
  currentLayers = opts.layers ?? [];

  currentLoopSeconds = loopSecondsFor(source, bpm);
  currentEndSeconds = currentLoopSeconds;
  disposeBand();
  const schedule = scheduleFor(source, bpm);
  schedulePart(schedule, currentLoop);
  scheduleLayers(bpm, currentLoop);
  transport.start();
}

export function playPrepared(prepared: PreparedPlay, bpm: number, opts: PlayOptions = {}): void {
  const transport = Tone.getTransport();
  transport.stop();
  transport.cancel();
  transport.seconds = 0;
  transport.bpm.value = bpm;

  currentSource = null;
  currentBpm = bpm;
  currentLoop = opts.loop ?? false;
  currentLoopSeconds = prepared.totalSeconds;
  currentEndSeconds = prepared.totalSeconds;
  currentLayers = [];
  disposeLayers();

  schedulePart(withHumanise(prepared.events), currentLoop);
  disposeBand();
  if (prepared.band !== undefined && prepared.band.length > 0) {
    bandPart = new Tone.Part<[number, BandEvent]>(
      (time, event) => {
        playBand(event, time);
      },
      prepared.band.map((event) => [event.t, event] as [number, BandEvent]),
    );
    bandPart.loop = currentLoop;
    if (currentLoop) bandPart.loopEnd = currentLoopSeconds;
    bandPart.start(0);
  }
  transport.start();
}

export function stop(): void {
  const transport = Tone.getTransport();
  transport.stop();
  transport.cancel();
  part?.dispose();
  part = null;
  disposeLayers();
  disposeBand();
  currentEndSeconds = null;
  forgetRinging();
  currentLayers = [];
  currentSource = null;
  currentSchedule = null;
}

// Changes tempo mid-play without losing the place: the whole section keeps looping and playback
// carries on from the same bar and beat, so the tab and chord shown stay with the sound.
export function setBpm(bpm: number): void {
  const transport = Tone.getTransport();
  if (currentSource === null) {
    currentBpm = bpm;
    transport.bpm.value = bpm;
    return;
  }

  const position = resumePosition(transport.seconds, currentBpm, bpm, getLoopSeconds());
  currentBpm = bpm;
  transport.bpm.value = bpm;
  transport.stop();
  transport.cancel();
  forgetRinging();

  currentLoopSeconds = loopSecondsFor(currentSource, bpm);
  currentEndSeconds = currentLoopSeconds;
  schedulePart(scheduleFor(currentSource, bpm), currentLoop);
  scheduleLayers(bpm, currentLoop);
  transport.start(Tone.now(), position);
}
