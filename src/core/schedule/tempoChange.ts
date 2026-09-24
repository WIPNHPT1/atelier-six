import { stepDurSeconds } from './buildSchedule.ts';

// Where playback should carry on (in seconds at the new tempo) after a tempo change: the same
// musical position — same bar and beat — so the tab, the chord shown and the sound stay together.
export function resumePosition(
  elapsedSeconds: number,
  oldBpm: number,
  newBpm: number,
  loopSeconds: number | null,
): number {
  const inPass =
    loopSeconds === null || loopSeconds <= 0 ? elapsedSeconds : elapsedSeconds % loopSeconds;
  const steps = Math.max(0, inPass) / stepDurSeconds(oldBpm);
  return steps * stepDurSeconds(newBpm);
}
