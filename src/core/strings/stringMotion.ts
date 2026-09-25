export type StringMotionParams = {
  amplitude: number;
  /** Visual oscillation frequency in Hz — far slower than the real pitch, so it reads. */
  freqHz: number;
  /** Exponential decay time constant, in seconds. */
  tau: number;
  /** The vibrating length, in the same units as `x`. */
  length: number;
};

const MIN_VIS_HZ = 2;
const MAX_VIS_HZ = 6;
const MIN_MIDI = 38;
const MAX_MIDI = 88;

/** Lower strings swing slower and wider; higher strings flicker faster. */
export function visualFrequency(midi: number): number {
  const clamped = Math.min(MAX_MIDI, Math.max(MIN_MIDI, midi));
  const t = (clamped - MIN_MIDI) / (MAX_MIDI - MIN_MIDI);
  return MIN_VIS_HZ + t * (MAX_VIS_HZ - MIN_VIS_HZ);
}

const PALM_MUTE_TAU = 0.15;
const OPEN_TAU = 1.1;

/** How long the string keeps ringing: short and damped when palm-muted, long when open. */
export function decayTau(palmMute: boolean): number {
  return palmMute ? PALM_MUTE_TAU : OPEN_TAU;
}

/** A·e^(−t/τ)·sin(2π·f_vis·t), shaped along the string by a standing wave sin(πx/L).
 * `t` is seconds since the pluck (negative or beyond a few τ reads as silent — callers
 * should stop drawing once the envelope is negligible). */
export function stringDisplacement(params: StringMotionParams, t: number, x: number): number {
  if (t < 0) return 0;
  const envelope = params.amplitude * Math.exp(-t / params.tau);
  const oscillation = Math.sin(2 * Math.PI * params.freqHz * t);
  const standingWave = Math.sin((Math.PI * x) / params.length);
  return envelope * oscillation * standingWave;
}
