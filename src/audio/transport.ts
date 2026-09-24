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
import { forgetRinging, playBand, playClick, playEvent } from './engine.ts';

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
let introPart: Tone.Part<[number, ScheduleEvent]> | null = null;
let layerParts: Tone.Part<[number, ScheduleEvent]>[] = [];
let currentLayers: LayerSource[] = [];
let currentSource: ScheduleSource | null = null;
let currentSchedule: ScheduleEvent[] | null = null;
let currentBpm = 120;
let currentLoop = false;
let currentLoopSeconds = 0;
let currentEndSeconds: number | null = null;
// A count-in's clicks sit before the downbeat at negative `t`, but Tone.Part silently drops
// negative-time events, so the whole schedule is shifted later by this much when building the
// Part; content then starts at this offset instead of 0, and a loop skips back to it (not 0) so
// the count-in only plays once.
let currentCountInSeconds = 0;
let bandPart: Tone.Part<[number, BandEvent]> | null = null;

function countInOffsetFor(schedule: ScheduleEvent[]): number {
  return Math.max(0, -Math.min(0, ...schedule.map((event) => event.t)));
}

// How far into the count-in/content timeline the transport actually is, in seconds, with the
// count-in period itself clamped to 0 (so UI sync can treat "still counting in" as bar/step 0).
export function getContentSeconds(transportSeconds: number): number {
  return Math.max(0, transportSeconds - currentCountInSeconds);
}

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

// `schedule` here is already content-relative (t >= 0, no count-in events): Tone's `loopStart`
// clips the *entire* playthrough to its window, not just repeats, so a leading count-in can't
// share a Part with looped content — the part just starts later instead, at `offset`.
function newContentPart(schedule: ScheduleEvent[], loop: boolean, pan: number, offset: number) {
  const created = new Tone.Part<[number, ScheduleEvent]>(
    (time, event) => {
      // Per-bar metronome clicks carry no string hits; playEvent would silently no-op them.
      if (event.kind === 'click') playClick(time, event.accent);
      else playEvent(event, time, 'clean', pan);
    },
    schedule.map((event) => [event.t, event] as [number, ScheduleEvent]),
  );
  created.loop = loop;
  if (loop) created.loopEnd = currentLoopSeconds;
  created.start(offset);
  return created;
}

// A one-shot part for the count-in's clicks, which sit before the downbeat at negative `t`
// (shifted here into non-negative Part-local time) and never repeat, even when the content loops.
function newIntroPart(countInEvents: ScheduleEvent[], offset: number) {
  const created = new Tone.Part<[number, ScheduleEvent]>(
    (time, event) => {
      playClick(time, event.accent);
    },
    countInEvents.map((event) => [event.t + offset, event] as [number, ScheduleEvent]),
  );
  created.start(0);
  return created;
}

function disposeIntro(): void {
  introPart?.dispose();
  introPart = null;
}

function disposeLayers(): void {
  for (const layerPart of layerParts) layerPart.dispose();
  layerParts = [];
}

function schedulePart(schedule: ScheduleEvent[], loop: boolean, offset: number): void {
  part?.dispose();
  disposeIntro();
  currentSchedule = schedule;
  const countInEvents = schedule.filter((event) => event.t < 0);
  if (countInEvents.length > 0) introPart = newIntroPart(countInEvents, offset);
  const contentEvents = schedule.filter((event) => event.t >= 0);
  part = newContentPart(contentEvents, loop, 0, offset);
}

// Layers never carry their own count-in; they share the primary source's offset so their
// content starts in sync with it once the count-in has played.
function scheduleLayers(bpm: number, loop: boolean, offset: number): void {
  disposeLayers();
  layerParts = currentLayers.map((layer) =>
    newContentPart(scheduleFor(layer.source, bpm), loop, layer.pan, offset),
  );
}

export function play(source: ScheduleSource, bpm: number, opts: PlayOptions = {}): void {
  const transport = Tone.getTransport();
  transport.stop();
  transport.cancel();
  transport.bpm.value = bpm;

  currentSource = source;
  currentBpm = bpm;
  currentLoop = opts.loop ?? false;
  currentLayers = opts.layers ?? [];

  currentLoopSeconds = loopSecondsFor(source, bpm);
  disposeBand();
  const schedule = scheduleFor(source, bpm);
  currentCountInSeconds = countInOffsetFor(schedule);
  currentEndSeconds = currentLoopSeconds + currentCountInSeconds;
  schedulePart(schedule, currentLoop, currentCountInSeconds);
  scheduleLayers(bpm, currentLoop, currentCountInSeconds);
  transport.start();
}

export function playPrepared(prepared: PreparedPlay, bpm: number, opts: PlayOptions = {}): void {
  const transport = Tone.getTransport();
  transport.stop();
  transport.cancel();
  transport.bpm.value = bpm;

  currentSource = null;
  currentBpm = bpm;
  currentLoop = opts.loop ?? false;
  currentLoopSeconds = prepared.totalSeconds;
  currentLayers = [];
  disposeLayers();

  const humanised = withHumanise(prepared.events);
  currentCountInSeconds = countInOffsetFor(humanised);
  currentEndSeconds = prepared.totalSeconds + currentCountInSeconds;
  schedulePart(humanised, currentLoop, currentCountInSeconds);
  disposeBand();
  if (prepared.band !== undefined && prepared.band.length > 0) {
    // Band events are already content-relative (t >= 0); see newContentPart on why the part
    // starts later at the offset rather than having its events shifted into a loop window.
    bandPart = new Tone.Part<[number, BandEvent]>(
      (time, event) => {
        playBand(event, time);
      },
      prepared.band.map((event) => [event.t, event] as [number, BandEvent]),
    );
    bandPart.loop = currentLoop;
    if (currentLoop) bandPart.loopEnd = currentLoopSeconds;
    bandPart.start(currentCountInSeconds);
  }
  transport.start();
}

export function stop(): void {
  const transport = Tone.getTransport();
  transport.stop();
  transport.cancel();
  part?.dispose();
  part = null;
  disposeIntro();
  disposeLayers();
  disposeBand();
  currentEndSeconds = null;
  currentCountInSeconds = 0;
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

  const position = resumePosition(
    getContentSeconds(transport.seconds),
    currentBpm,
    bpm,
    getLoopSeconds(),
  );
  currentBpm = bpm;
  transport.bpm.value = bpm;
  transport.stop();
  transport.cancel();
  forgetRinging();

  currentLoopSeconds = loopSecondsFor(currentSource, bpm);
  const schedule = scheduleFor(currentSource, bpm);
  currentCountInSeconds = countInOffsetFor(schedule);
  currentEndSeconds = currentLoopSeconds + currentCountInSeconds;
  schedulePart(schedule, currentLoop, currentCountInSeconds);
  scheduleLayers(bpm, currentLoop, currentCountInSeconds);
  // Resuming is always into content (the count-in never replays after a tempo change).
  transport.start(Tone.now(), currentCountInSeconds + position);
}
