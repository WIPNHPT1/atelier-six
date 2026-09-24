import type { Finger, Shape } from '../../core/shapes/types';
import { standard } from '../../core/tuning';
import { usePlaybackStore } from '../../audio/playbackStore';

export const FOUNDATIONS = [
  { id: 'read-tab', minutes: 6 },
  { id: 'hold', minutes: 3 },
  { id: 'tune-up', minutes: 5 },
  { id: 'fretting', minutes: 5 },
  { id: 'hand-health', minutes: 3 },
] as const;

export type FoundationId = (typeof FOUNDATIONS)[number]['id'];

export function isFoundation(id: string | undefined): id is FoundationId {
  return FOUNDATIONS.some((lesson) => lesson.id === id);
}

export const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];
const STRING_COUNT = 6;
const NOTE_SECONDS = 1.5;

// A one-note "shape" so the Fretboard can light a single string and fret.
export function noteShape(string: number, fret: number): Shape {
  const finger: Finger = fret === 0 ? 0 : (Math.min(4, Math.max(1, fret)) as Finger);
  const notes = Array.from({ length: STRING_COUNT }, (_, index) =>
    STRING_COUNT - index === string ? { fret, finger } : { fret: null, finger: null },
  ) as Shape['notes'];
  return {
    id: `note-${String(string)}-${String(fret)}`,
    chord: '',
    notes,
    register: 'low',
    tags: [],
  };
}

export function midiOf(string: number, fret: number): number {
  return (standard[STRING_COUNT - string] as number) + fret;
}

export function playNote(string: number, fret: number): void {
  void usePlaybackStore.getState().startLesson({
    lessonId: 'foundations-note',
    title: '',
    chordNames: [],
    bpm: 60,
    loop: false,
    prepared: {
      events: [
        {
          t: 0,
          kind: 'pick',
          step: 0,
          bar: 0,
          chordIndex: 0,
          strings: [{ string, midi: midiOf(string, fret), offset: 0 }],
          dir: 'pick',
          velocity: 0.8,
          palmMute: false,
          accent: false,
        },
      ],
      totalSeconds: NOTE_SECONDS,
    },
  });
}
