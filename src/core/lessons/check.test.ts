import { describe, expect, it } from 'vitest';
import { STYLES } from '../../data/styles/index.ts';
import { getShapes } from '../shapes/library.ts';
import type { StyleSheet } from '../style/types.ts';
import {
  buildLesson,
  candidateShapes,
  lessonChords,
  renderLesson,
  shapePosition,
} from './check.ts';
import type { Lesson } from './types.ts';

const power = STYLES.power as StyleSheet;

function lesson(extra: Partial<Lesson> = {}): Lesson {
  return {
    id: 'test',
    module: 'power',
    title: 't',
    goal: 'g',
    progression: { chords: ['E5', 'A5'] },
    candidates: { tags: ['power'] },
    arrangement: {
      sections: [
        {
          name: 'verse',
          register: 'low',
          rhythm: 'eighths-muted',
          layers: [],
          dynamics: 1,
          bars: 2,
        },
      ],
    },
    startBpm: 100,
    targetBpm: 160,
    tuning: 'standard',
    capo: 0,
    tips: [],
    listen: [],
    ...extra,
  };
}

describe('lesson building', () => {
  it('resolves a style progression in a key', () => {
    expect(lessonChords(lesson({ progression: { id: 'I5-V5-vi5-IV5', key: 'C' } }), power)).toEqual(
      ['C5', 'G5', 'A5', 'F5'],
    );
    expect(() => lessonChords(lesson({ progression: { id: 'nope', key: 'C' } }), power)).toThrow(
      /nope/,
    );
  });

  it('filters candidates by any tag and an optional register', () => {
    const low = candidateShapes(lesson({ candidates: { tags: ['power'], register: 'low' } }), 'A5');
    expect(low.every((shape) => shape.register === 'low')).toBe(true);
    expect(candidateShapes(lesson(), 'A5').length).toBeGreaterThan(low.length);
  });

  it('throws when a chord has no candidate shape', () => {
    expect(() => buildLesson(lesson({ candidates: { tags: ['anchored'] } }), power)).toThrow(/E5/);
  });

  it('chooses shapes for section chord overrides too', () => {
    const built = buildLesson(
      lesson({
        progression: { chords: ['E5'] },
        arrangement: {
          sections: [
            {
              name: 'verse',
              register: 'low',
              rhythm: 'eighths-muted',
              layers: [],
              dynamics: 1,
              bars: 1,
            },
            {
              name: 'breakdown',
              register: 'low',
              rhythm: 'stop-push',
              layers: [],
              dynamics: 1,
              bars: 2,
              chords: ['E5', 'G5'],
            },
          ],
        },
      }),
      power,
    );
    expect(Object.keys(built.shapes).sort()).toEqual(['E5', 'G5']);
  });

  it('places an open shape at the nut', () => {
    const open = getShapes('E5').find((shape) => shape.id === 'E5.open');
    expect(open && shapePosition(open)).toBe(1);
    const nut = {
      ...(open as NonNullable<typeof open>),
      notes: open?.notes.map((n) => ({ ...n, fret: n.fret && 0 })),
    };
    expect(shapePosition(nut as NonNullable<typeof open>)).toBe(0);
  });
});

describe('renderLesson', () => {
  it('mutes the stroke before a shift that is too fast', () => {
    const built = buildLesson(lesson({ progression: { chords: ['A5', 'F5'] } }), power);
    const verse = built.arrangement.sections[0] as Lesson['arrangement']['sections'][number];
    const mid = { ...built, arrangement: { sections: [{ ...verse, register: 'mid' as const }] } };
    const { piece } = renderLesson(mid, power);
    const beforeChange = piece.sections[0]?.events.find(
      (event) => event.bar === 0 && event.t === 12,
    );
    expect(beforeChange?.dir).toBe('mute');
  });

  it('mutes back only as far as the previous chord, even when that is not enough', () => {
    const style: StyleSheet = {
      ...power,
      mustInclude: [],
      rhythmCells: [
        {
          id: 'wide',
          level: 1,
          steps: [
            { t: 0, dir: 'D' },
            { t: 15, dir: 'D' },
          ],
        },
      ],
    };
    const section = {
      name: 'verse' as const,
      register: 'mid' as const,
      rhythm: 'wide',
      layers: [],
      dynamics: 1,
      bars: 2,
    };
    const built = buildLesson(
      lesson({
        progression: { chords: ['A5', 'F5'] },
        targetBpm: 1000,
        arrangement: { sections: [section] },
      }),
      style,
    );
    const events = renderLesson(built, style).piece.sections[0]?.events ?? [];
    const firstBar = events.filter((event) => event.bar === 0);
    expect(firstBar.filter((event) => event.t === 15).every((e) => e.dir === 'mute')).toBe(true);
    expect(firstBar.filter((event) => event.t === 0).every((e) => e.dir === 'D')).toBe(true);
  });

  it('plays only the strings a step names and marks muted steps', () => {
    const style: StyleSheet = {
      ...power,
      rhythmCells: [
        {
          id: 'top',
          level: 1,
          steps: [
            { t: 0, dir: 'mute', strings: [5] },
            { t: 8, dir: 'D' },
          ],
        },
      ],
    };
    const built = buildLesson(
      lesson({
        arrangement: {
          sections: [
            { name: 'verse', register: 'low', rhythm: 'top', layers: [], dynamics: 1, bars: 1 },
          ],
        },
      }),
      style,
    );
    const { tab, piece } = renderLesson(built, style);
    expect(tab.filter((event) => event.time === 0).map((event) => event.string)).toEqual([5]);
    expect(piece.sections[0]?.events[0]?.articulations).toContain('mute');
  });

  it('throws on an unknown rhythm, chord or shape', () => {
    const built = buildLesson(lesson(), power);
    const withRhythm = (rhythm: string) => ({
      ...built,
      arrangement: {
        sections: [
          {
            name: 'verse' as const,
            register: 'low' as const,
            rhythm,
            layers: [],
            dynamics: 1,
            bars: 1,
          },
        ],
      },
    });
    expect(() => renderLesson(withRhythm('nope'), power)).toThrow(/nope/);
    expect(() => renderLesson({ ...built, chords: ['H5'] }, power)).toThrow(/H5/);
    const high = {
      ...built,
      candidates: { tags: ['anchored'] },
      shapes: {},
      arrangement: {
        sections: [
          {
            name: 'verse' as const,
            register: 'high' as const,
            rhythm: 'eighths-muted',
            layers: [],
            dynamics: 1,
            bars: 1,
            chords: ['E5'],
          },
        ],
      },
    };
    expect(() => renderLesson(high, power)).toThrow(/no shape/);
  });
});
