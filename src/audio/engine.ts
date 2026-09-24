import * as Tone from 'tone';
import type { ScheduleEvent } from '../core/schedule/buildSchedule.ts';

const VOICE_COUNT = 6;
const NORMAL_RESONANCE = 0.96;
const MUTED_RESONANCE = 0.35;
const NORMAL_FILTER_HZ = 20000;
const MUTED_FILTER_HZ = 900;
const MUTE_RECOVER_SECONDS = 0.12;
const PAN_SPREAD = 0.12;
const CLICK_ACCENT_NOTE = 'C4';
const CLICK_NOTE = 'C3';
const CLICK_DURATION_SECONDS = 0.03;

declare global {
  interface Window {
    __a6audio?: { state: string };
  }
}

type AudioGraph = {
  voices: Tone.PluckSynth[];
  filter: Tone.Filter;
  click: Tone.MembraneSynth;
};

let graph: AudioGraph | null = null;

function buildGraph(): AudioGraph {
  const filter = new Tone.Filter(NORMAL_FILTER_HZ, 'lowpass');
  const compressor = new Tone.Compressor();
  const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.12 });
  filter.connect(compressor);
  compressor.connect(reverb);
  reverb.toDestination();

  const voices = Array.from({ length: VOICE_COUNT }, (_, index) => {
    const voice = new Tone.PluckSynth({
      attackNoise: 1,
      dampening: 4000,
      resonance: NORMAL_RESONANCE,
    });
    const panner = new Tone.Panner((index - (VOICE_COUNT - 1) / 2) * PAN_SPREAD);
    voice.connect(panner);
    panner.connect(filter);
    return voice;
  });

  const click = new Tone.MembraneSynth({
    envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 },
  }).toDestination();

  return { voices, filter, click };
}

export async function ensureAudio(): Promise<void> {
  await Tone.start();
  graph ??= buildGraph();
  window.__a6audio = { state: Tone.getContext().state };
}

export function playEvent(event: ScheduleEvent, time: number): void {
  if (graph === null || event.kind === 'ghost') return;
  const { voices, filter } = graph;

  if (event.palmMute) {
    filter.frequency.cancelScheduledValues(time);
    filter.frequency.setValueAtTime(MUTED_FILTER_HZ, time);
    filter.frequency.linearRampTo(
      NORMAL_FILTER_HZ,
      MUTE_RECOVER_SECONDS,
      time + MUTE_RECOVER_SECONDS,
    );
  }

  event.strings.forEach((hit) => {
    const voice = voices[VOICE_COUNT - hit.string];
    if (voice === undefined) return;
    voice.resonance = event.palmMute ? MUTED_RESONANCE : NORMAL_RESONANCE;
    voice.triggerAttack(Tone.Frequency(hit.midi, 'midi').toFrequency(), time + hit.offset);
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
