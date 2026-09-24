import { useCallback, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { tapTempo } from '../core/tapTempo.ts';
import { ensureAudio, playClick } from './engine.ts';
import { MAX_BPM, MIN_BPM } from './metronomeConstants.ts';

const DEFAULT_BPM = 100;
const DEFAULT_COUNT_IN_BARS = 1;
const BEATS_PER_BAR = 4;
const TAP_WINDOW = 4;

function clampBpm(bpm: number): number {
  return Math.min(MAX_BPM, Math.max(MIN_BPM, bpm));
}

export type UseMetronomeResult = {
  bpm: number;
  setBpm: (bpm: number) => void;
  isOn: boolean;
  toggle: () => void;
  countInBars: number;
  setCountInBars: (bars: number) => void;
  tap: () => void;
};

export function useMetronome(): UseMetronomeResult {
  const [bpm, setBpmState] = useState(DEFAULT_BPM);
  const [isOn, setIsOn] = useState(false);
  const [countInBars, setCountInBars] = useState(DEFAULT_COUNT_IN_BARS);
  const loopRef = useRef<Tone.Loop | null>(null);
  const beatRef = useRef(0);
  const tapsRef = useRef<number[]>([]);

  const setBpm = useCallback((next: number) => {
    setBpmState(clampBpm(next));
  }, []);

  useEffect(() => {
    Tone.getTransport().bpm.value = bpm;
  }, [bpm]);

  useEffect(() => {
    if (!isOn) return;
    let cancelled = false;
    beatRef.current = 0;
    void ensureAudio().then(() => {
      if (cancelled) return;
      const transport = Tone.getTransport();
      transport.bpm.value = bpm;
      loopRef.current = new Tone.Loop((time) => {
        const accent = beatRef.current % BEATS_PER_BAR === 0;
        playClick(time, accent);
        beatRef.current += 1;
      }, '4n').start(0);
      transport.start();
    });
    return () => {
      cancelled = true;
      loopRef.current?.dispose();
      loopRef.current = null;
      const transport = Tone.getTransport();
      transport.stop();
      transport.cancel();
    };
    // bpm changes are applied by the effect above without restarting this loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOn]);

  const toggle = useCallback(() => {
    setIsOn((prev) => !prev);
  }, []);

  const tap = useCallback(() => {
    const now = performance.now();
    const taps = [...tapsRef.current, now].slice(-TAP_WINDOW);
    tapsRef.current = taps;
    const estimate = tapTempo(taps);
    if (estimate !== null) setBpm(estimate);
  }, [setBpm]);

  return { bpm, setBpm, isOn, toggle, countInBars, setCountInBars, tap };
}
