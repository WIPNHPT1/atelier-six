import { useEffect, useState } from 'react';
import {
  nextTempo,
  type Attempt,
  type TempoDecision,
  type TempoRange,
} from '../../core/practice/tempo';

export type AdaptiveTempoOptions = {
  bpm: number;
  range: TempoRange;
  onTempo: (bpm: number) => void;
  onSimplify?: () => void;
  onRecord?: (clean: boolean, bpm: number) => void;
};

export type AdaptiveTempo = {
  record: (clean: boolean) => void;
  last: TempoDecision | null;
};

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
}

// Clean / Missed after each loop nudges the tempo (C and M keys too).
export function useAdaptiveTempo({
  bpm,
  range,
  onTempo,
  onSimplify,
  onRecord,
}: AdaptiveTempoOptions): AdaptiveTempo {
  const [history, setHistory] = useState<Attempt[]>([]);
  const [last, setLast] = useState<TempoDecision | null>(null);

  function record(clean: boolean) {
    const next = [...history, { bpm, clean }];
    const decision = nextTempo(next, range);
    setHistory(next);
    setLast(decision);
    onRecord?.(clean, bpm);
    if (decision.bpm !== bpm) onTempo(decision.bpm);
    if (decision.simplify) onSimplify?.();
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
      const key = event.key.toLowerCase();
      if (key === 'c') record(true);
      if (key === 'm') record(false);
    }
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  });

  return { record, last };
}
