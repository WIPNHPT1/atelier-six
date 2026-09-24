import * as Tone from 'tone';
import {
  buildSchedule,
  stepDurSeconds,
  type ScheduleEvent,
  type ScheduleInput,
} from '../core/schedule/buildSchedule.ts';
import { humanise } from '../core/schedule/humanise.ts';
import { applyFreezes } from '../core/drills/drills.ts';
import { remainingFromBar } from '../core/schedule/remainingFromBar.ts';
import { useSettingsStore } from '../app/settingsStore.ts';
import { playEvent } from './engine.ts';

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
  const schedule = scheduleFor(source, bpm);
  schedulePart(schedule, currentLoop);
  scheduleLayers(bpm, currentLoop);
  transport.start();
}

export function stop(): void {
  const transport = Tone.getTransport();
  transport.stop();
  transport.cancel();
  part?.dispose();
  part = null;
  disposeLayers();
  currentLayers = [];
  currentSource = null;
  currentSchedule = null;
}

export function setBpm(bpm: number): void {
  const transport = Tone.getTransport();
  if (currentSource === null) {
    currentBpm = bpm;
    transport.bpm.value = bpm;
    return;
  }

  const elapsedStep = Math.round(transport.seconds / (15 / currentBpm));
  const resumeBar = Math.ceil(elapsedStep / 16);
  const { shapes, bars } = remainingFromBar(currentSource.shapes, currentSource.bars, resumeBar);

  currentBpm = bpm;
  transport.bpm.value = bpm;
  transport.stop();
  transport.cancel();
  transport.seconds = 0;

  currentLoopSeconds = loopSecondsFor({ ...currentSource, shapes, bars }, bpm);
  const schedule = scheduleFor({ ...currentSource, shapes, bars }, bpm);
  currentSource = { ...currentSource, shapes, bars };
  schedulePart(schedule, currentLoop);
  currentLayers = currentLayers.map((layer) => {
    const rest = remainingFromBar(layer.source.shapes, layer.source.bars, resumeBar);
    return { ...layer, source: { ...layer.source, ...rest } };
  });
  scheduleLayers(bpm, currentLoop);
  transport.start();
}
