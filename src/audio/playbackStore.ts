import { create } from 'zustand';
import { secondsToStep } from '../core/schedule/buildSchedule.ts';
import type { LayerSource, ScheduleSource } from './transport.ts';

export type StartLessonInput = {
  lessonId: string;
  title: string;
  chordNames: string[];
  source: ScheduleSource;
  bpm: number;
  loop?: boolean;
  layers?: LayerSource[];
};

export type PlaybackState = {
  isPlaying: boolean;
  step: number;
  bar: number;
  chordIndex: number;
  bpm: number;
  lessonId: string | null;
  title: string;
  chordNames: string[];
  startLesson: (input: StartLessonInput) => Promise<void>;
  stopPlayback: () => void;
  setTempo: (bpm: number) => void;
};

let rafId: number | null = null;

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
  title: '',
  chordNames: [],
  startLesson: async ({ lessonId, title, chordNames, source, bpm, loop, layers = [] }) => {
    const [{ ensureAudio, ensurePans }, transport, Tone] = await Promise.all([
      import('./engine.ts'),
      import('./transport.ts'),
      import('tone'),
    ]);
    await ensureAudio();
    await ensurePans(layers.map((layer) => layer.pan));
    transport.play(source, bpm, { loop: loop ?? false, layers });
    setMediaSession(title, () => {
      usePlaybackStore.getState().stopPlayback();
    });
    set({ isPlaying: true, lessonId, title, chordNames, bpm, step: 0, bar: 0, chordIndex: 0 });

    function tick(): void {
      const schedule = transport.getSchedule();
      const state = usePlaybackStore.getState();
      if (schedule === null || !state.isPlaying) {
        rafId = null;
        return;
      }
      const step = secondsToStep(Tone.getTransport().seconds, transport.getBpm());
      const current = schedule.filter((event) => event.step <= step).at(-1) ?? schedule[0];
      if (current) {
        usePlaybackStore.setState({ step, bar: current.bar, chordIndex: current.chordIndex });
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
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
    set({ isPlaying: false });
  },
}));
