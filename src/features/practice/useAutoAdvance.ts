import { useEffect, useRef } from 'react';
import { startMic, stopMic } from '../../audio/mic';
import { detectPitch } from '../../core/pitch/detectPitch';
import { exactMidi } from '../../core/pitch/exactMidi';
import {
  initAutoAdvance,
  startListening,
  tickAutoAdvance,
  type AutoAdvanceContext,
} from '../../core/practice/autoAdvance';
import { matchesTarget } from '../../core/practice/matchesTarget';
import { lowestRootMidi } from '../../core/practice/rootMidi';
import { getChord } from '../../core/shapes/library';
import type { Shape } from '../../core/shapes/types';
import type { Tuning } from '../../core/tuning';

const TOLERANCE_CENTS = 40;

export function isMicSupported(): boolean {
  try {
    return typeof navigator.mediaDevices.getUserMedia === 'function';
  } catch {
    return false;
  }
}

export type UseAutoAdvanceOptions = {
  // On when the "Listen" toggle is on and playback is paused (self-paced practice).
  enabled: boolean;
  shapes: Shape[];
  index: number;
  tuning: Tuning;
  capo: number;
  onAdvance: (fromIndex: number, toIndex: number) => void;
};

function targetMidiFor(
  shapes: Shape[],
  index: number,
  tuning: Tuning,
  capo: number,
): number | null {
  const nextShape = shapes[(index + 1) % shapes.length];
  if (!nextShape) return null;
  const chord = getChord(nextShape.chord);
  if (!chord) return null;
  return lowestRootMidi(nextShape, chord.root, tuning, capo);
}

// Listens to the mic and advances a self-paced index when the next chord's root sounds.
export function useAutoAdvance({
  enabled,
  shapes,
  index,
  tuning,
  capo,
  onAdvance,
}: UseAutoAdvanceOptions): void {
  const machineRef = useRef<AutoAdvanceContext>(initAutoAdvance());
  const targetRef = useRef<number | null>(null);
  const onAdvanceRef = useRef(onAdvance);
  const indexRef = useRef(index);

  useEffect(() => {
    onAdvanceRef.current = onAdvance;
    indexRef.current = index;
  });

  useEffect(() => {
    targetRef.current = targetMidiFor(shapes, index, tuning, capo);
    machineRef.current = startListening();
  }, [shapes, index, tuning, capo]);

  useEffect(() => {
    if (!enabled) return;

    function handleFrame(buffer: Float32Array, sampleRate: number) {
      const target = targetRef.current;
      const result = target === null ? null : detectPitch(buffer, sampleRate);
      const matched =
        result !== null && matchesTarget(exactMidi(result.freq), target ?? 0, TOLERANCE_CENTS);
      machineRef.current = tickAutoAdvance(machineRef.current, matched, performance.now());
      if (machineRef.current.state === 'advanced') {
        const from = indexRef.current;
        const to = (from + 1) % shapes.length;
        onAdvanceRef.current(from, to);
      }
    }

    void startMic(handleFrame);
    return () => {
      stopMic();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}
