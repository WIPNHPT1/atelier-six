import { describe, expect, it } from 'vitest';
import chordsData from '../../data/chords.json' with { type: 'json' };
import { PROGRESSIONS } from '../../data/progressions.ts';
import { checkPlayable, type Fingering, type TabEvent } from '../tab/playability.ts';
import { candidatesFor, optimise } from '../engine/optimise.ts';
import { resolveProgression } from '../progression.ts';
import type { Finger, Shape } from './types.ts';

const DATA = chordsData as unknown as Record<string, Shape[]>;
const GATE_BPM = 200;

function shapeToEvents(shape: Shape): { events: TabEvent[]; fingering: Fingering } {
  const events: TabEvent[] = [];
  const fingering: (Finger | null)[] = [];

  shape.notes.forEach((note, index) => {
    if (note.fret === null || note.fret === 0) return;
    events.push({ bar: 0, time: 0, duration: 4, string: 6 - index, fret: note.fret });
    fingering.push(note.finger);
  });

  return { events, fingering };
}

describe('every chord shape is playable at 200 bpm', () => {
  for (const [name, shapes] of Object.entries(DATA)) {
    for (const shape of shapes) {
      it(`${name} / ${shape.id}`, () => {
        const { events, fingering } = shapeToEvents(shape);
        const issues = checkPlayable(events, fingering, GATE_BPM).filter(
          (issue) => issue.type === 'missing-finger' || issue.type === 'span',
        );
        expect(issues).toEqual([]);
      });
    }
  }
});

describe('every example progression is playable at 200 bpm', () => {
  for (const progression of PROGRESSIONS) {
    it(`${progression.id} in C`, () => {
      const chordNames = resolveProgression({ roman: progression.roman }, 0);
      const result = optimise(candidatesFor(chordNames));
      expect(result.shapes.length).toBe(chordNames.length);

      for (let i = 1; i < result.shapes.length; i++) {
        const from = shapeToEvents(result.shapes[i - 1] as Shape);
        const to = shapeToEvents(result.shapes[i] as Shape);
        const fromLast = from.events[from.events.length - 1];
        const toFirst = to.events[0];
        if (!fromLast || !toFirst) continue;

        const gap = (progression.beatsPerChord[i - 1] ?? 4) * 4;
        const events: TabEvent[] = [
          { ...fromLast, time: 0 },
          { ...toFirst, time: gap },
        ];
        const fingering: Fingering = [1, 1];
        const issues = checkPlayable(events, fingering, GATE_BPM).filter(
          (issue) => issue.type === 'shift-speed',
        );
        expect(issues).toEqual([]);
      }
    });
  }
});
