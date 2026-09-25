import * as Tone from 'tone';
import { parseNote } from '../core/theory/pitch.ts';
import { useSettingsStore } from '../app/settingsStore.ts';

const TAP_VOLUME_DB = -24;
const TAP_NOTE = 'C2';
const TAP_DURATION_SECONDS = 0.05;

const CHIME_ROOT_OCTAVE = 4;
// add9: root, major 3rd, 5th, 9th (a major 2nd, an octave up).
const ADD9_INTERVALS = [0, 4, 7, 14];
const CHIME_VOLUME_DB = -14;
const CHIME_NOTE_SECONDS = 1;
const CHIME_SPACING_SECONDS = 0.09;

type UiSoundGraph = { tap: Tone.MembraneSynth; chime: Tone.PolySynth };
let graph: UiSoundGraph | null = null;

function buildGraph(): UiSoundGraph {
  const tap = new Tone.MembraneSynth({
    pitchDecay: 0.01,
    octaves: 2,
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.02 },
  });
  tap.chain(new Tone.Volume(TAP_VOLUME_DB), Tone.getDestination());

  const chime = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 1, sustain: 0, release: 1 },
  });
  chime.chain(new Tone.Volume(CHIME_VOLUME_DB), Tone.getDestination());

  return { tap, chime };
}

function soundEnabled(): boolean {
  return useSettingsStore.getState().sound;
}

/** A soft wood-tap for a primary action. Never called before this gesture starts audio. */
export function playUiTap(): void {
  if (!soundEnabled()) return;
  Tone.start()
    .then(() => {
      graph ??= buildGraph();
      graph.tap.triggerAttackRelease(TAP_NOTE, TAP_DURATION_SECONDS);
    })
    .catch(() => {
      // No Web Audio (jsdom, an exotic browser) — a decorative click sound just skips.
    });
}

/** A gentle arpeggiated add9 in the lesson's key, for marking a lesson complete. */
export function playCompletionChime(keyRoot = 'C'): void {
  if (!soundEnabled()) return;
  const rootMidi = 12 * (CHIME_ROOT_OCTAVE + 1) + parseNote(keyRoot);
  Tone.start()
    .then(() => {
      graph ??= buildGraph();
      const now = Tone.now();
      ADD9_INTERVALS.forEach((interval, i) => {
        const note = Tone.Frequency(rootMidi + interval, 'midi').toNote();
        graph?.chime.triggerAttackRelease(
          note,
          CHIME_NOTE_SECONDS,
          now + i * CHIME_SPACING_SECONDS,
          0.5,
        );
      });
    })
    .catch(() => {
      // No Web Audio — skip.
    });
}
