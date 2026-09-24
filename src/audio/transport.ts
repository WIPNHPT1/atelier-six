import * as Tone from 'tone';
import {
  buildSchedule,
  type ScheduleEvent,
  type ScheduleInput,
} from '../core/schedule/buildSchedule.ts';
import { humanise } from '../core/schedule/humanise.ts';
import { remainingFromBar } from '../core/schedule/remainingFromBar.ts';
import { useSettingsStore } from '../app/settingsStore.ts';
import { playEvent } from './engine.ts';

const HUMANISE_SEED = 6;

function withHumanise(schedule: ScheduleEvent[]): ScheduleEvent[] {
  if (useSettingsStore.getState().robotMode) return schedule;
  return humanise(schedule, { seed: HUMANISE_SEED });
}

export type ScheduleSource = Omit<ScheduleInput, 'bpm'>;
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
  if (loop) {
    const lastEvent = schedule[schedule.length - 1];
    created.loopEnd = lastEvent ? lastEvent.t + 0.001 : 0;
  }
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
    newPart(withHumanise(buildSchedule({ ...layer.source, bpm })), loop, layer.pan),
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

  const schedule = withHumanise(buildSchedule({ ...source, bpm }));
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

  const schedule = withHumanise(buildSchedule({ ...currentSource, shapes, bars, bpm }));
  currentSource = { ...currentSource, shapes, bars };
  schedulePart(schedule, currentLoop);
  currentLayers = currentLayers.map((layer) => {
    const rest = remainingFromBar(layer.source.shapes, layer.source.bars, resumeBar);
    return { ...layer, source: { ...layer.source, ...rest } };
  });
  scheduleLayers(bpm, currentLoop);
  transport.start();
}
