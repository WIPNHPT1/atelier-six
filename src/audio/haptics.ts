/** Feature-detected: no-op where Vibration API is unsupported (all of iOS web). */
export function vibrate(ms: number): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  navigator.vibrate(ms);
}
