import { stepDurSeconds } from '../schedule/buildSchedule.ts';
import type { SectionName } from '../lessons/types.ts';
import { chordTones, type ChordSpec } from '../theory/chord.ts';

export type DrumHit = 'kick' | 'snare' | 'hihatClosed' | 'hihatOpen' | 'crash';

export type BandEvent =
  | { t: number; part: 'drums'; drum: DrumHit; velocity: number }
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

// Drums, bass and (for Britpop) a soft pad under each bar, humanised later with the guitar.
export function buildBand(style: BandStyle, bars: BandBar[], bpm: number): BandEvent[] {
  const stepDur = stepDurSeconds(bpm);
  const events: BandEvent[] = [];
  bars.forEach((bar, index) => {
    const at = (step: number) => (index * STEPS_PER_BAR + step) * stepDur;
    const level = 0.55 + 0.4 * bar.dynamics;
    const stop = bar.section === 'breakdown';
    const groove = bar.dynamics >= 0.9 ? GROOVES[style].loud : GROOVES[style].main;

    if (bar.firstOfSection)
      events.push({ t: at(0), part: 'drums', drum: 'crash', velocity: level });
    if (stop) {
      // Stop-time: the whole band hits with the guitar and leaves the gaps empty.
      for (const step of bar.hits) {
        events.push({ t: at(step), part: 'drums', drum: 'kick', velocity: level });
        events.push({ t: at(step), part: 'drums', drum: 'crash', velocity: level * 0.8 });
        events.push({
          t: at(step),
          part: 'bass',
          midi: bassMidi(bar.chord),
          duration: stepDur,
          velocity: level,
        });
      }
      return;
    }
    for (const step of groove.kick)
      events.push({ t: at(step), part: 'drums', drum: 'kick', velocity: level });
    for (const step of groove.snare)
      events.push({ t: at(step), part: 'drums', drum: 'snare', velocity: level });
    for (const step of groove.hats) {
      events.push({ t: at(step), part: 'drums', drum: 'hihatClosed', velocity: level * 0.6 });
    }
    for (const step of groove.open ?? []) {
      events.push({ t: at(step), part: 'drums', drum: 'hihatOpen', velocity: level * 0.5 });
    }

    const bassSteps = style === 'power' ? [0, 2, 4, 6, 8, 10, 12, 14] : [0, 6, 8];
    bassSteps.forEach((step, i) => {
      const next = bassSteps[i + 1] ?? STEPS_PER_BAR;
      events.push({
        t: at(step),
        part: 'bass',
        midi: bassMidi(bar.chord),
        duration: (next - step) * stepDur * 0.9,
        velocity: level,
      });
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
  return events.sort((a, b) => a.t - b.t);
}
