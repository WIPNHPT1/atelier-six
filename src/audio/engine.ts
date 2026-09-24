import * as Tone from 'tone';
import type { ScheduleEvent } from '../core/schedule/buildSchedule.ts';
import {
  BASS_BASE_URL,
  BASS_SAMPLE_FILES,
  CABINET_IR_URL,
  DRUM_URLS,
  GUITAR_BASE_URL,
  GUITAR_SAMPLE_FILES,
} from './samples.ts';
import { cacheSample } from './sampleCache.ts';

const NORMAL_FILTER_HZ = 20000;
const MUTED_FILTER_HZ = 900;
const MUTE_RECOVER_SECONDS = 0.12;
const CLICK_ACCENT_NOTE = 'C4';
const CLICK_NOTE = 'C3';
const CLICK_DURATION_SECONDS = 0.03;
const MIN_VELOCITY = 0.05;
const MAX_VELOCITY = 1;
const DRUM_VOLUME_DB = -6;

declare global {
  interface Window {
    __a6audio?: { state: string };
  }
}

type AudioGraph = {
  guitar: Tone.Sampler;
  bass: Tone.Sampler;
  drums: Record<keyof typeof DRUM_URLS, Tone.Player>;
  filter: Tone.Filter;
  click: Tone.MembraneSynth;
};

let graph: AudioGraph | null = null;

function warmSampleCache(baseUrl: string, files: Record<string, string>): void {
  Object.values(files).forEach((file) => {
    void cacheSample(baseUrl + file);
  });
  void cacheSample(CABINET_IR_URL);
}

function buildGraph(): AudioGraph {
  const filter = new Tone.Filter(NORMAL_FILTER_HZ, 'lowpass');
  const cabinet = new Tone.Convolver(CABINET_IR_URL);
  const compressor = new Tone.Compressor();
  const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.12 });
  filter.connect(cabinet);
  cabinet.connect(compressor);
  compressor.connect(reverb);
  reverb.toDestination();

  const guitar = new Tone.Sampler({
    urls: GUITAR_SAMPLE_FILES,
    baseUrl: GUITAR_BASE_URL,
  });
  guitar.connect(filter);

  const bassChannel = new Tone.Volume(0).connect(compressor);
  const bass = new Tone.Sampler({
    urls: BASS_SAMPLE_FILES,
    baseUrl: BASS_BASE_URL,
  });
  bass.connect(bassChannel);

  const drumBus = new Tone.Volume(DRUM_VOLUME_DB).connect(compressor);
  const drums = Object.fromEntries(
    Object.entries(DRUM_URLS).map(([name, url]) => {
      const player = new Tone.Player(url);
      player.connect(drumBus);
      return [name, player];
    }),
  ) as AudioGraph['drums'];

  warmSampleCache(GUITAR_BASE_URL, GUITAR_SAMPLE_FILES);
  warmSampleCache(BASS_BASE_URL, BASS_SAMPLE_FILES);
  Object.values(DRUM_URLS).forEach((url) => {
    void cacheSample(url);
  });

  const click = new Tone.MembraneSynth({
    envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 },
  }).toDestination();

  return { guitar, bass, drums, filter, click };
}

export async function ensureAudio(): Promise<void> {
  await Tone.start();
  graph ??= buildGraph();
  await Tone.loaded();
  window.__a6audio = { state: Tone.getContext().state };
}

function clampVelocity(velocity: number): number {
  return Math.min(MAX_VELOCITY, Math.max(MIN_VELOCITY, velocity));
}

export function playEvent(event: ScheduleEvent, time: number): void {
  if (graph === null || event.kind === 'ghost') return;
  const { guitar, filter } = graph;

  if (event.palmMute) {
    filter.frequency.cancelScheduledValues(time);
    filter.frequency.setValueAtTime(MUTED_FILTER_HZ, time);
    filter.frequency.linearRampTo(
      NORMAL_FILTER_HZ,
      MUTE_RECOVER_SECONDS,
      time + MUTE_RECOVER_SECONDS,
    );
  }

  const velocity = clampVelocity(event.velocity);
  event.strings.forEach((hit) => {
    guitar.triggerAttack(
      Tone.Frequency(hit.midi, 'midi').toFrequency(),
      time + hit.offset,
      velocity,
    );
  });
}

export function playClick(time: number, accent: boolean): void {
  if (graph === null) return;
  graph.click.triggerAttackRelease(
    accent ? CLICK_ACCENT_NOTE : CLICK_NOTE,
    CLICK_DURATION_SECONDS,
    time,
  );
}

export function playBassNote(midi: number, time: number, duration: number, velocity = 0.8): void {
  if (graph === null) return;
  graph.bass.triggerAttackRelease(
    Tone.Frequency(midi, 'midi').toFrequency(),
    duration,
    time,
    clampVelocity(velocity),
  );
}

export function playDrum(name: keyof typeof DRUM_URLS, time: number): void {
  if (graph === null) return;
  const player = graph.drums[name];
  if (player.loaded) player.start(time);
}
