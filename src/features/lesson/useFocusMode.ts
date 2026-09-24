import { useEffect } from 'react';

export const FOCUS_DELAY_MS = 3000;
const WAKE_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'touchstart'] as const;

// While `active`, fades out elements marked `data-focus-hide` after a quiet spell; any pointer
// move, tap or key (pedals send keys) brings them straight back. CSS owns the fade, so the
// motion setting decides whether it animates or hides instantly.
export function useFocusMode(active: boolean): void {
  useEffect(() => {
    const root = document.documentElement;
    if (!active) {
      root.removeAttribute('data-focus');
      return;
    }
    let timer = window.setTimeout(enter, FOCUS_DELAY_MS);
    function enter() {
      root.setAttribute('data-focus', 'on');
    }
    function wake() {
      root.removeAttribute('data-focus');
      window.clearTimeout(timer);
      timer = window.setTimeout(enter, FOCUS_DELAY_MS);
    }
    for (const name of WAKE_EVENTS) window.addEventListener(name, wake, { passive: true });
    return () => {
      window.clearTimeout(timer);
      for (const name of WAKE_EVENTS) window.removeEventListener(name, wake);
      root.removeAttribute('data-focus');
    };
  }, [active]);
}
