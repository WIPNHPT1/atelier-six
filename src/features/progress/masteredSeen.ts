const KEY = 'a6.masteredSeen';

/** Shape ids already shown with their draw-in animation, so it only plays once each. */
export function getSeenMastered(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function markSeenMastered(ids: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // Private mode or storage blocked — the draw-in just replays next visit, harmless.
  }
}
