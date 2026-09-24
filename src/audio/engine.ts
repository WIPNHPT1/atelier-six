import * as Tone from 'tone';
import type { BandEvent } from '../core/band/band.ts';
import type { ScheduleEvent } from '../core/schedule/buildSchedule.ts';
import {
  BASS_BASE_URL,
  BASS_SAMPLE_FILES,
  CABINET_IR_URL,
  DRUM_NOTES,
  DRUM_URLS,
  GUITAR_BASE_URL,
  GUITAR_SAMPLE_FILES,
  type DrumName,
} from './samples.ts';
import { cacheSample } from './sampleCache.ts';

export type GuitarTone = 'clean' | 'driven';

const OPEN_FILTER_HZ = 20000;
const CLEAN_MUTE_HZ = 900;
// Palm muting damps the string before it reaches the amp, so the driven path
// filters *before* the distortion: dull input, crunchy "chug" output.
const DRIVEN_MUTE_HZ = 320;
const MUTE_RECOVER_SECONDS = 0.05;
// Distortion lifts decaying tails, so muted notes must stop hard or they ring
// into each other and sound open rather than chuggy.
const PALM_MUTE_NOTE_SECONDS = 0.075;
const SAMPLER_RELEASE_SECONDS = 0.03;
const DRIVE_HIGHPASS_HZ = 90;
const DRIVE_THUMP_HZ = 160;
const DRIVE_THUMP_DB = 6;
const DRIVE_PRE_GAIN_DB = 22;
const DRIVE_AMOUNT = 1;
const DRIVE_TONE_HZ = 2000;
const DRIVE_LEVEL_DB = 0;
const CLICK_ACCENT_NOTE = 'C4';
const CLICK_NOTE = 'C3';
const CLICK_DURATION_SECONDS = 0.03;
const MIN_VELOCITY = 0.05;
const MAX_VELOCITY = 1;
const DRUM_VOLUME_DB = -4;
const PAD_VOLUME_DB = -16;
const CHIME_VOLUME_DB = -12;
const CHIME_NOTES = ['E5', 'B5'];
const CHIME_SPACING_SECONDS = 0.12;

declare global {
  interface Window {
    __a6audio?: { state: string };
  }
}

type GuitarPath = { sampler: Tone.Sampler; muteFilter: Tone.Filter; muteHz: number };

type AudioGraph = {
  guitar: Record<GuitarTone, GuitarPath>;
  // Extra clean guitars for arrangement layers, one per pan position.
  panned: Map<number, GuitarPath>;
  mix: Tone.Compressor;
  bass: Tone.Sampler;
  drums: Tone.Sampler;
  click: Tone.MembraneSynth;
  pad: Tone.PolySynth;
  chime: Tone.PolySynth;
};

let graph: AudioGraph | null = null;

function newGuitarSampler(): Tone.Sampler {
  return new Tone.Sampler({
    urls: GUITAR_SAMPLE_FILES,
    baseUrl: GUITAR_BASE_URL,
    release: SAMPLER_RELEASE_SECONDS,
  });
}

function buildGraph(): AudioGraph {
  const cabinet = new Tone.Convolver(CABINET_IR_URL);
  const compressor = new Tone.Compressor();
  const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.12 });
  cabinet.connect(compressor);
  compressor.connect(reverb);
  reverb.toDestination();

  const clean = newGuitarSampler();
  const cleanMute = new Tone.Filter(OPEN_FILTER_HZ, 'lowpass');
  clean.chain(cleanMute, cabinet);

  const driven = newGuitarSampler();
  const drivenMute = new Tone.Filter({ frequency: OPEN_FILTER_HZ, type: 'lowpass', rolloff: -24 });
  driven.chain(
    new Tone.Filter(DRIVE_HIGHPASS_HZ, 'highpass'),
    drivenMute,
    new Tone.Filter({ frequency: DRIVE_THUMP_HZ, type: 'lowshelf', gain: DRIVE_THUMP_DB }),
    new Tone.Gain(Tone.dbToGain(DRIVE_PRE_GAIN_DB)),
    new Tone.Distortion({ distortion: DRIVE_AMOUNT, oversample: '4x' }),
    new Tone.Filter({ frequency: DRIVE_TONE_HZ, type: 'lowpass', rolloff: -24 }),
    new Tone.Volume(DRIVE_LEVEL_DB),
    cabinet,
  );

  const bass = new Tone.Sampler({ urls: BASS_SAMPLE_FILES, baseUrl: BASS_BASE_URL });
  bass.connect(compressor);

  const drumUrls = Object.fromEntries(
    (Object.keys(DRUM_NOTES) as DrumName[]).map((name) => [DRUM_NOTES[name], DRUM_URLS[name]]),
  );
  const drums = new Tone.Sampler({ urls: drumUrls });
  drums.chain(new Tone.Volume(DRUM_VOLUME_DB), compressor);

  const guitarUrls = Object.values(GUITAR_SAMPLE_FILES).map((f) => GUITAR_BASE_URL + f);
  const bassUrls = Object.values(BASS_SAMPLE_FILES).map((f) => BASS_BASE_URL + f);
  [...guitarUrls, ...bassUrls, ...Object.values(DRUM_URLS), CABINET_IR_URL].forEach((url) => {
    void cacheSample(url);
  });

  const click = new Tone.MembraneSynth({
    envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 },
  }).toDestination();

  // A soft, slow pad under Britpop choruses, and a quiet bell for finishing a tune.
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.4, decay: 0.3, sustain: 0.6, release: 1.2 },
  });
  pad.chain(new Tone.Volume(PAD_VOLUME_DB), reverb);
  const chime = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.005, decay: 1.2, sustain: 0, release: 1.2 },
  });
  chime.chain(new Tone.Volume(CHIME_VOLUME_DB), reverb);

  return {
    pad,
    chime,
    guitar: {
      clean: { sampler: clean, muteFilter: cleanMute, muteHz: CLEAN_MUTE_HZ },
      driven: { sampler: driven, muteFilter: drivenMute, muteHz: DRIVEN_MUTE_HZ },
    },
    panned: new Map(),
    mix: compressor,
    bass,
    drums,
    click,
  };
}

export async function ensureAudio(): Promise<void> {
  await Tone.start();
  graph ??= buildGraph();
  await Tone.loaded();
  window.__a6audio = { state: Tone.getContext().state };
}

// Builds (once) a clean guitar per pan position and waits for its samples.
export async function ensurePans(pans: number[]): Promise<void> {
  await ensureAudio();
  const current = graph;
  if (current === null) return;
  for (const pan of pans) {
    if (pan === 0 || current.panned.has(pan)) continue;
    const sampler = newGuitarSampler();
    const muteFilter = new Tone.Filter(OPEN_FILTER_HZ, 'lowpass');
    sampler.chain(
      muteFilter,
      new Tone.Convolver(CABINET_IR_URL),
      new Tone.Panner(pan),
      current.mix,
    );
    current.panned.set(pan, { sampler, muteFilter, muteHz: CLEAN_MUTE_HZ });
  }
  await Tone.loaded();
}

function clampVelocity(velocity: number): number {
  return Math.min(MAX_VELOCITY, Math.max(MIN_VELOCITY, velocity));
}

export function playEvent(
  event: ScheduleEvent,
  time: number,
  tone: GuitarTone = 'clean',
  pan = 0,
): void {
  if (graph === null || event.kind === 'ghost') return;
  const { sampler, muteFilter, muteHz } = graph.panned.get(pan) ?? graph.guitar[tone];

  // The hand stays on the strings for a whole palm-muted run; only lift it
  // (open the filter) when an unmuted hit arrives.
  muteFilter.frequency.cancelScheduledValues(time);
  if (event.palmMute) {
    muteFilter.frequency.setValueAtTime(muteHz, time);
  } else {
    muteFilter.frequency.linearRampTo(OPEN_FILTER_HZ, MUTE_RECOVER_SECONDS, time);
  }

  const velocity = clampVelocity(event.velocity);
  event.strings.forEach((hit) => {
    const frequency = Tone.Frequency(hit.midi, 'midi').toFrequency();
    const at = time + hit.offset;
    if (event.palmMute) {
      sampler.triggerAttackRelease(frequency, PALM_MUTE_NOTE_SECONDS, at, velocity);
    } else {
      sampler.triggerAttack(frequency, at, velocity);
    }
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

export function playDrum(name: DrumName, time: number, velocity = 0.9): void {
  if (graph === null) return;
  graph.drums.triggerAttack(DRUM_NOTES[name], time, clampVelocity(velocity));
}

export function playBand(event: BandEvent, time: number): void {
  if (graph === null) return;
  if (event.part === 'drums') {
    playDrum(event.drum, time, event.velocity);
  } else if (event.part === 'bass') {
    playBassNote(event.midi, time, event.duration, event.velocity);
  } else {
    const notes = event.midis.map((midi) => Tone.Frequency(midi, 'midi').toFrequency());
    graph.pad.triggerAttackRelease(notes, event.duration, time, clampVelocity(event.velocity));
  }
}

// A quiet two-note bell for a finished tune (no points, no fanfare).
export function playChime(): void {
  if (graph === null) return;
  const now = Tone.now();
  CHIME_NOTES.forEach((note, i) => {
    graph?.chime.triggerAttackRelease(note, 1, now + i * CHIME_SPACING_SECONDS, 0.6);
  });
}
