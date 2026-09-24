import { useShallow } from 'zustand/react/shallow';
import { usePlaybackStore } from './playbackStore.ts';

export type UsePlaybackResult = {
  isPlaying: boolean;
  step: number;
  bar: number;
  chordIndex: number;
};

export function usePlayback(): UsePlaybackResult {
  return usePlaybackStore(
    useShallow((state) => ({
      isPlaying: state.isPlaying,
      step: state.step,
      bar: state.bar,
      chordIndex: state.chordIndex,
    })),
  );
}
