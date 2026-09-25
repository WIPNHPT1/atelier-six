import { useEffect, useState } from 'react';
import { getActiveStrum } from '../../audio/playbackStore';
import { registerFrameCallback } from './loop';

const STRING_COUNT = 6;
const HIGHLIGHT_MS = 220;
// A strum counts as "just happened" within this many seconds of its nominal onset — wide
// enough to always catch it on the next animation frame, narrow enough not to retrigger.
const JUST_PLUCKED_SECONDS = 0.03;

function stringNumber(index: number): number {
  return STRING_COUNT - index;
}

/** With motion off, played strings briefly highlight instead of vibrating — this returns the
 * currently-lit string numbers (see Fretboard's `highlightStrings`). Poll-driven off the same
 * shared frame loop the canvas uses, so it costs nothing extra when disabled. */
export function useStrumHighlight(enabled: boolean): number[] {
  const [strings, setStrings] = useState<number[]>([]);

  useEffect(() => {
    if (!enabled) return;
    let timeoutId: number | null = null;

    const unregister = registerFrameCallback(() => {
      const strum = getActiveStrum();
      if (!strum || strum.tSincePluck < 0 || strum.tSincePluck > JUST_PLUCKED_SECONDS) return;
      setStrings(strum.strings.map((hit) => stringNumber(hit.string)));
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setStrings([]);
      }, HIGHLIGHT_MS);
    });

    return () => {
      unregister();
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [enabled]);

  return enabled ? strings : [];
}
