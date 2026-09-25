// One requestAnimationFrame loop shared by every mounted living-strings canvas (and the
// motion-off highlight fallback), instead of one loop per instance. Runs only while at least
// one callback is registered, and pauses while the tab is hidden.

type FrameCallback = () => void;

const callbacks = new Set<FrameCallback>();
let rafId: number | null = null;

function frame(): void {
  rafId = null;
  for (const callback of callbacks) callback();
  ensureRunning();
}

function ensureRunning(): void {
  if (rafId !== null || callbacks.size === 0) return;
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
  rafId = requestAnimationFrame(frame);
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') ensureRunning();
  });
}

export function registerFrameCallback(callback: FrameCallback): () => void {
  callbacks.add(callback);
  ensureRunning();
  return () => {
    callbacks.delete(callback);
  };
}
