import { stepDurSeconds } from '../schedule/buildSchedule.ts';
import type { SectionName } from '../lessons/types.ts';
import { chordTones, type ChordSpec } from '../theory/chord.ts';

export type DrumHit = 'kick' | 'snare' | 'hihatClosed' | 'hihatOpen' | 'crash';

// detune: cents of pitch variation per drum hit, so repeated hits aren't identical copies.
export type BandEvent =
  | { t: number; part: 'drums'; drum: DrumHit; velocity: number; detune: number }
  | { t: number; part: 'bass'; midi: number; duration: number; velocity: number }
  | { t: number; part: 'pad'; midis: number[]; duration: number; velocity: number };

export type BandBar = {
  chord: ChordSpec;
  section: SectionName;
  dynamics: number;
  // Onsets (sixteenths) of the guitar rhythm, so stops and hits line up with the band.
  hits: number[];
  firstOfSection: boolean;
};

export type BandStyle = 'power' | 'open';

const STEPS_PER_BAR = 16;
const BASS_LOW_E = 40;
const PAD_BASE = 60;
const PAD_DYNAMICS = 0.45;

type Groove = { kick: number[]; snare: number[]; hats: number[]; open?: number[] };

const GROOVES: Record<BandStyle, { main: Groove; loud: Groove }> = {
  // Pop punk: straight driving eighths, snare on 2 and 4.
  power: {
    main: { kick: [0, 8, 10], snare: [4, 12], hats: [0, 2, 4, 6, 8, 10, 12, 14] },
    loud: { kick: [0, 6, 8, 10], snare: [4, 12], hats: [], open: [0, 2, 4, 6, 8, 10, 12, 14] },
  },
  // Britpop: laid-back rock beat, sixteenth hats in the chorus.
  open: {
    main: { kick: [0, 10], snare: [4, 12], hats: [0, 2, 4, 6, 8, 10, 12, 14] },
    loud: { kick: [0, 7, 10], snare: [4, 12], hats: Array.from({ length: 16 }, (_, i) => i) },
  },
};

function bassMidi(chord: ChordSpec): number {
  return BASS_LOW_E + ((chord.root - 4 + 12) % 12);
}

function padMidis(chord: ChordSpec): number[] {
  return chordTones(chord).map((pc) => PAD_BASE + ((pc - PAD_BASE + 120) % 12));
}

const HAT_ON_BEAT = 0.6;
const HAT_OFF_BEAT = 0.42;
const HAT_SIXTEENTH = 0.3;
const OPEN_HAT = 0.85;
const FILL_STEPS = [12, 13, 14, 15];
const FILL_START = 0.55;
const FILL_RISE = 0.12;
const BEAT = 4;
const EIGHTH = 2;
const BASS_GATE = 0.9;

// Human feel (PRD §20.3): small seeded timing, loudness and pitch variation on every hit.
const HUMAN = {
  seed: 20,
  kickSnareMs: 4,
  hatMs: 7,
  bassMs: 8,
  bassLateMs: 5,
  velocityPct: 10,
  hatVelocityPct: 16,
  detuneCents: 12,
};

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

function hatLevel(step: number): number {
  if (step % BEAT === 0) return HAT_ON_BEAT;
  return step % EIGHTH === 0 ? HAT_OFF_BEAT : HAT_SIXTEENTH;
}

export function humaniseBand(events: BandEvent[], seed = HUMAN.seed): BandEvent[] {
  const random = mulberry32(seed);
  const roll = () => random() * 2 - 1;
  return events.map((event) => {
    const timing = roll();
    const loudness = roll();
    const pitch = roll();
    if (event.part === 'drums') {
      const hat = event.drum === 'hihatClosed' || event.drum === 'hihatOpen';
      const ms = hat ? HUMAN.hatMs : HUMAN.kickSnareMs;
      const pct = hat ? HUMAN.hatVelocityPct : HUMAN.velocityPct;
      return {
        ...event,
        t: Math.max(0, event.t + (timing * ms) / 1000),
        velocity: event.velocity * (1 + (loudness * pct) / 100),
        detune: pitch * HUMAN.detuneCents,
      };
    }
    // The bass sits a touch behind the beat, like a relaxed player.
    const lateMs = event.part === 'bass' ? HUMAN.bassLateMs : 0;
    return {
      ...event,
      t: Math.max(0, event.t + (timing * HUMAN.bassMs + lateMs) / 1000),
      velocity: event.velocity * (1 + (loudness * HUMAN.velocityPct) / 100),
    };
  });
}

// Drums, bass and (for Britpop) a second ringing guitar under each bar, with fills into each
// new section and a human feel.
export function buildBand(style: BandStyle, bars: BandBar[], bpm: number): BandEvent[] {
  const stepDur = stepDurSeconds(bpm);
  const events: BandEvent[] = [];
  bars.forEach((bar, index) => {
    const at = (step: number) => (index * STEPS_PER_BAR + step) * stepDur;
    const level = 0.55 + 0.4 * bar.dynamics;
    const stop = bar.section === 'breakdown';
    const groove = bar.dynamics >= 0.9 ? GROOVES[style].loud : GROOVES[style].main;
    const drum = (step: number, name: DrumHit, velocity: number) => {
      events.push({ t: at(step), part: 'drums', drum: name, velocity, detune: 0 });
    };
    const bass = (step: number, duration: number) => {
      events.push({
        t: at(step),
        part: 'bass',
        midi: bassMidi(bar.chord),
        duration,
        velocity: level,
      });
    };

    if (bar.firstOfSection) drum(0, 'crash', level);
    if (stop) {
      // Stop-time: the whole band hits with the guitar and leaves the gaps empty.
      for (const step of bar.hits) {
        drum(step, 'kick', level);
        drum(step, 'crash', level * 0.8);
        bass(step, stepDur);
      }
      return;
    }

    // The last beat before a new section is a snare fill instead of the groove.
    const next = bars[index + 1];
    const fill = next !== undefined && next.firstOfSection && next.section !== 'breakdown';
    const inGroove = (step: number) => !fill || step < (FILL_STEPS[0] as number);
    for (const step of groove.kick.filter(inGroove)) drum(step, 'kick', level);
    for (const step of groove.snare.filter(inGroove)) drum(step, 'snare', level);
    for (const step of groove.hats.filter(inGroove))
      drum(step, 'hihatClosed', level * hatLevel(step));
    for (const step of (groove.open ?? []).filter(inGroove)) {
      drum(step, 'hihatOpen', level * hatLevel(step) * OPEN_HAT);
    }
    if (fill) {
      FILL_STEPS.forEach((step, i) => {
        drum(step, 'snare', level * (FILL_START + i * FILL_RISE));
      });
    }

    const bassSteps = style === 'power' ? [0, 2, 4, 6, 8, 10, 12, 14] : [0, 6, 8];
    bassSteps.forEach((step, i) => {
      bass(step, ((bassSteps[i + 1] ?? STEPS_PER_BAR) - step) * stepDur * BASS_GATE);
    });

    if (style === 'open') {
      events.push({
        t: at(0),
        part: 'pad',
        midis: padMidis(bar.chord),
        duration: STEPS_PER_BAR * stepDur,
        velocity: PAD_DYNAMICS * bar.dynamics,
      });
    }
  });
  return humaniseBand(events).sort((a, b) => a.t - b.t);
}
