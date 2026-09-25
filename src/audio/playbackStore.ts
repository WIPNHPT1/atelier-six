import { create } from 'zustand';
import { useSettingsStore } from '../app/settingsStore.ts';
import { secondsToStep } from '../core/schedule/buildSchedule.ts';
import type { StringHit } from '../core/schedule/buildSchedule.ts';
import { vibrate } from './haptics.ts';
import type { LayerSource, PreparedPlay, ScheduleSource } from './transport.ts';

const BEAT_ONE_VIBRATE_MS = 8;

export type StartLessonInput = {
  lessonId: string;
  title: string;
  chordNames: string[];
  // Built from shapes and a rhythm at play time; not needed when `prepared` is given.
  source?: ScheduleSource;
  bpm: number;
  loop?: boolean;
  layers?: LayerSource[];
  // A whole arrangement built up front; `source` is then only used for chord names.
  prepared?: PreparedPlay;
};

export type PlaybackState = {
  isPlaying: boolean;
  step: number;
  bar: number;
  chordIndex: number;
  bpm: number;
  lessonId: string | null;
  // The lesson or tune that just played through to its end (for the finish screen).
  finishedId: string | null;
  title: string;
  chordNames: string[];
  startLesson: (input: StartLessonInput) => Promise<void>;
  stopPlayback: () => void;
  setTempo: (bpm: number) => void;
};

let rafId: number | null = null;
let lastCheckedBeatStep = -1;

export type ActiveStrum = { strings: StringHit[]; palmMute: boolean; tSincePluck: number };
let activeStrum: ActiveStrum | null = null;

/** The most recently played strum, and how long ago it started — polled imperatively by the
 * living-strings canvas loop, kept out of the zustand store so it doesn't cause a re-render
 * on every animation frame. */
export function getActiveStrum(): ActiveStrum | null {
  return activeStrum;
}

// Where the music is in what you actually hear. Transport.seconds runs ahead: Tone schedules
// ~0.1 s early, and speakers (Bluetooth most of all) add their own delay, which would show the
// next chord while the previous one is still sounding.
function audibleSeconds(Tone: typeof import('tone')): number {
  const context = Tone.getContext();
  const raw = context.rawContext as Partial<AudioContext>;
  const latency = (raw.outputLatency ?? 0) + (raw.baseLatency ?? 0);
  const heardAt = Math.max(0, context.currentTime - latency);
  return Math.max(0, Tone.getTransport().getSecondsAtTime(heardAt));
}

function setMediaSession(title: string, onStop: () => void): void {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({ title, artist: 'Atelier Six' });
  navigator.mediaSession.playbackState = 'playing';
  navigator.mediaSession.setActionHandler('pause', onStop);
  navigator.mediaSession.setActionHandler('stop', onStop);
}

// transport.ts (and the Tone.js it pulls in) is dynamically imported so pages
// that never touch playback - most of the app - don't ship it in their chunk.
export const usePlaybackStore = create<PlaybackState>((set) => ({
  isPlaying: false,
  step: 0,
  bar: 0,
  chordIndex: 0,
  bpm: 120,
  lessonId: null,
  finishedId: null,
  title: '',
  chordNames: [],
  startLesson: async ({
    lessonId,
    title,
    chordNames,
    source,
    bpm,
    loop,
    layers = [],
    prepared,
  }) => {
    const [{ ensureAudio, ensurePans, LAYER_PAN }, transport, Tone] = await Promise.all([
      import('./engine.ts'),
      import('./transport.ts'),
      import('tone'),
    ]);
    await ensureAudio();
    const bandLayer = prepared?.band?.some((event) => event.part === 'pad') === true;
    await ensurePans([...layers.map((layer) => layer.pan), ...(bandLayer ? [LAYER_PAN] : [])]);
    if (prepared !== undefined) transport.playPrepared(prepared, bpm, { loop: loop ?? false });
    else if (source !== undefined) transport.play(source, bpm, { loop: loop ?? false, layers });
    else return;
    setMediaSession(title, () => {
      usePlaybackStore.getState().stopPlayback();
    });
    set({
      isPlaying: true,
      lessonId,
      finishedId: null,
      title,
      chordNames,
      bpm,
      step: 0,
      bar: 0,
      chordIndex: 0,
    });
    lastCheckedBeatStep = -1;

    function tick(): void {
      const schedule = transport.getSchedule();
      const state = usePlaybackStore.getState();
      if (schedule === null || !state.isPlaying) {
        rafId = null;
        return;
      }
      const elapsed = audibleSeconds(Tone);
      const end = transport.getEndSeconds();
      if (end !== null && elapsed >= end) {
        rafId = null;
        const finished = state.lessonId;
        usePlaybackStore.getState().stopPlayback();
        usePlaybackStore.setState({ finishedId: finished });
        void import('./engine.ts').then(({ playChime }) => {
          playChime();
        });
        return;
      }
      const loopSeconds = transport.getLoopSeconds();
      const contentElapsed = transport.getContentSeconds(elapsed);
      const seconds = loopSeconds === null ? contentElapsed : contentElapsed % loopSeconds;
      const step = secondsToStep(seconds, transport.getBpm());
      if (useSettingsStore.getState().haptics) {
        if (step < lastCheckedBeatStep) lastCheckedBeatStep = -1; // the loop wrapped
        const crossedBeatOne = schedule.some(
          (event) =>
            event.kind === 'click' &&
            event.accent &&
            event.step > lastCheckedBeatStep &&
            event.step <= step,
        );
        if (crossedBeatOne) vibrate(BEAT_ONE_VIBRATE_MS);
        lastCheckedBeatStep = step;
      }
      const current = schedule.filter((event) => event.step <= step).at(-1) ?? schedule[0];
      if (current) {
        usePlaybackStore.setState({ step, bar: current.bar, chordIndex: current.chordIndex });
        activeStrum =
          current.kind === 'click' || current.strings.length === 0
            ? null
            : {
                strings: current.strings,
                palmMute: current.palmMute,
                tSincePluck: seconds - current.t,
              };
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId ??= requestAnimationFrame(tick);
  },
  setTempo: (bpm) => {
    set({ bpm });
    if (!usePlaybackStore.getState().isPlaying) return;
    void import('./transport.ts').then(({ setBpm }) => {
      setBpm(bpm);
    });
  },
  stopPlayback: () => {
    void import('./transport.ts').then(({ stop }) => {
      stop();
    });
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    activeStrum = null;
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
    set({ isPlaying: false });
  },
}));
