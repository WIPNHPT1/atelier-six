const TAP_WINDOW = 4;
const MIN_TAPS_FOR_ESTIMATE = 2;
const MS_PER_MINUTE = 60000;

export function tapTempo(timestamps: number[]): number | null {
  const recent = timestamps.slice(-TAP_WINDOW);
  if (recent.length < MIN_TAPS_FOR_ESTIMATE) return null;

  const intervals: number[] = [];
  let previous: number | undefined;
  for (const t of recent) {
    if (previous !== undefined) intervals.push(t - previous);
    previous = t;
  }

  const averageMs = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  return MS_PER_MINUTE / averageMs;
}
