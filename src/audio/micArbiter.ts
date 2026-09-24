export type MicOwner = 'tuner' | 'voice';

let owner: MicOwner | null = null;
const stoppers = new Map<MicOwner, () => void>();

// Voice commands and the tuner both want the microphone; only one may run at once.
export function registerMicStopper(forOwner: MicOwner, stop: () => void): () => void {
  stoppers.set(forOwner, stop);
  return () => {
    if (stoppers.get(forOwner) === stop) stoppers.delete(forOwner);
  };
}

export function claimMic(forOwner: MicOwner): void {
  if (owner !== null && owner !== forOwner) stoppers.get(owner)?.();
  owner = forOwner;
}

export function releaseMic(forOwner: MicOwner): void {
  if (owner === forOwner) owner = null;
}
