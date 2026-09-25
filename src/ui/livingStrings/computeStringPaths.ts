import { decayTau, stringDisplacement, visualFrequency } from '../../core/strings/stringMotion';
import type { ActiveStrum } from '../../audio/playbackStore';

export type StringPoint = { x: number; y: number };
export type StringPath = { stringIndex: number; points: StringPoint[] };

const SEGMENTS = 40;
// Once the envelope has decayed past this many time constants it's visually silent —
// stop drawing (and stop paying for the samples) rather than tracing a flat line forever.
const SILENT_AFTER_TAU = 4;

/** One polyline per currently-vibrating string, in canvas-local coordinates
 * (x: 0..gridSpan from the nut side, already offset by `pad`; y: displacement from rest). */
export function computeStringPaths(
  strum: ActiveStrum,
  gridSpan: number,
  pad: number,
  amplitude: number,
): StringPath[] {
  const tau = decayTau(strum.palmMute);
  const maxAge = tau * SILENT_AFTER_TAU;

  return strum.strings.reduce<StringPath[]>((paths, hit) => {
    const t = strum.tSincePluck - hit.offset / 1000;
    if (t < 0 || t > maxAge) return paths;

    const params = { amplitude, freqHz: visualFrequency(hit.midi), tau, length: gridSpan };
    const points = Array.from({ length: SEGMENTS + 1 }, (_, i) => {
      const x = (i / SEGMENTS) * gridSpan;
      return { x: pad + x, y: stringDisplacement(params, t, x) };
    });
    return [...paths, { stringIndex: hit.string, points }];
  }, []);
}
