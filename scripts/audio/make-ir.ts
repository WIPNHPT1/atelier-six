import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SAMPLE_RATE = 44100;
const DURATION_SECONDS = 0.35;
const SEED = 6;

// A 1x12 guitar cabinet: sub-bass and top air rolled off, a broad presence
// bump around 2.5 kHz, decaying fast (cabinets are not reverb — a few hundred ms).
const HIGHPASS_HZ = 90;
const LOWPASS_HZ = 5200;
const PRESENCE_HZ = 2500;
const PRESENCE_Q = 1.1;
const PRESENCE_GAIN_DB = 6;
const DECAY_TIME_CONSTANT = 0.07;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function onePoleLowpass(input: Float64Array, cutoffHz: number): Float64Array {
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / SAMPLE_RATE;
  const alpha = dt / (rc + dt);
  const out = new Float64Array(input.length);
  let prev = 0;
  for (let i = 0; i < input.length; i++) {
    const sample = input[i] ?? 0;
    prev = prev + alpha * (sample - prev);
    out[i] = prev;
  }
  return out;
}

function onePoleHighpass(input: Float64Array, cutoffHz: number): Float64Array {
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / SAMPLE_RATE;
  const alpha = rc / (rc + dt);
  const out = new Float64Array(input.length);
  let prevIn = 0;
  let prevOut = 0;
  for (let i = 0; i < input.length; i++) {
    const sample = input[i] ?? 0;
    const value = alpha * (prevOut + sample - prevIn);
    out[i] = value;
    prevIn = sample;
    prevOut = value;
  }
  return out;
}

function peakingBoost(
  input: Float64Array,
  centerHz: number,
  q: number,
  gainDb: number,
): Float64Array {
  // Simple resonant bandpass added back on top of the dry signal ("peaking" shape).
  const omega = (2 * Math.PI * centerHz) / SAMPLE_RATE;
  const alpha = Math.sin(omega) / (2 * q);
  const cosw = Math.cos(omega);
  const b0 = alpha;
  const b2 = -alpha;
  const a0 = 1 + alpha;
  const a1 = -2 * cosw;
  const a2 = 1 - alpha;
  const out = new Float64Array(input.length);
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  const gain = 10 ** (gainDb / 20) - 1;
  for (let i = 0; i < input.length; i++) {
    const x0 = input[i] ?? 0;
    const y0 = (b0 * x0 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    out[i] = x0 + gain * y0;
    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = y0;
  }
  return out;
}

export function makeCabinetIr(): Float64Array {
  const length = Math.round(SAMPLE_RATE * DURATION_SECONDS);
  const random = mulberry32(SEED);
  const noise = new Float64Array(length);
  for (let i = 0; i < length; i++) {
    const envelope = Math.exp(-i / (SAMPLE_RATE * DECAY_TIME_CONSTANT));
    noise[i] = (random() * 2 - 1) * envelope;
  }

  const shaped = peakingBoost(
    onePoleHighpass(onePoleLowpass(noise, LOWPASS_HZ), HIGHPASS_HZ),
    PRESENCE_HZ,
    PRESENCE_Q,
    PRESENCE_GAIN_DB,
  );

  let peak = 0;
  for (const s of shaped) peak = Math.max(peak, Math.abs(s));
  const scale = peak > 0 ? 0.95 / peak : 1;
  const out = new Float64Array(length);
  for (let i = 0; i < length; i++) out[i] = (shaped[i] ?? 0) * scale;
  return out;
}

function encodeWavMono16(samples: Float64Array, sampleRate: number): Buffer {
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * bytesPerSample, 28);
  buffer.writeUInt16LE(bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i] ?? 0));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * bytesPerSample);
  }
  return buffer;
}

function main(): void {
  const ir = makeCabinetIr();
  const wav = encodeWavMono16(ir, SAMPLE_RATE);
  const outPath = fileURLToPath(new URL('../../public/audio/cabinet-ir.wav', import.meta.url));
  writeFileSync(outPath, wav);

  console.log(`Wrote ${outPath} (${String(wav.length)} bytes)`);
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
