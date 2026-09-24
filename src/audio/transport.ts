import * as Tone from 'tone';
import {
  buildSchedule,
  type ScheduleEvent,
  type ScheduleInput,
} from '../core/schedule/buildSchedule.ts';
import { remainingFromBar } from '../core/schedule/remainingFromBar.ts';
import { playEvent } from './engine.ts';

export type ScheduleSource = Omit<ScheduleInput, 'bpm'>;

type PlayOptions = { loop?: boolean };

let part: Tone.Part<[number, ScheduleEvent]> | null = null;
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

function schedulePart(schedule: ScheduleEvent[], loop: boolean): void {
  part?.dispose();
  currentSchedule = schedule;
  const newPart = new Tone.Part<[number, ScheduleEvent]>(
    (time, event) => {
      playEvent(event, time);
    },
    schedule.map((event) => [event.t, event] as [number, ScheduleEvent]),
  );
  newPart.loop = loop;
  if (loop) {
    const lastEvent = schedule[schedule.length - 1];
    newPart.loopEnd = lastEvent ? lastEvent.t + 0.001 : 0;
  }
  newPart.start(0);
  part = newPart;
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

  const schedule = buildSchedule({ ...source, bpm });
  schedulePart(schedule, currentLoop);
  transport.start();
}

export function stop(): void {
  const transport = Tone.getTransport();
  transport.stop();
  transport.cancel();
  part?.dispose();
  part = null;
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

  const schedule = buildSchedule({ ...currentSource, shapes, bars, bpm });
  currentSource = { ...currentSource, shapes, bars };
  schedulePart(schedule, currentLoop);
  transport.start();
}
