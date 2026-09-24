import { useEffect } from 'react';
import { addPractice, localDay } from '../../core/progress/record';
import { useProgress } from './store';

const MS_PER_MINUTE = 60_000;
const PRECISION = 100;

// Adds the time spent while `active` to today's practice minutes.
export function usePracticeTimer(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const started = Date.now();
    return () => {
      const minutes = Math.round(((Date.now() - started) / MS_PER_MINUTE) * PRECISION) / PRECISION;
      if (minutes <= 0) return;
      void useProgress
        .getState()
        .update((data) => addPractice(data, { date: localDay(started), minutes }));
    };
  }, [active]);
}
