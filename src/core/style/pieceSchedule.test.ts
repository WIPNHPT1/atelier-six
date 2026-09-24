import { describe, expect, it } from 'vitest';
import { standard } from '../tuning.ts';
import { pieceAscii, pieceToSchedule } from './pieceSchedule.ts';
import type { Piece } from './types.ts';

const piece: Piece = {
  id: 'p',
  kind: 'riff',
  bpm: 100,
  subdivision: 16,
  swing: 50,
  tuning: 'standard',
  capo: 0,
  sections: [
    {
      name: 'riff',
      events: [
        {
          bar: 0,
          t: 0,
          duration: 4,
          string: 6,
          fret: 3,
          dir: 'pick',
          articulations: ['accent', 'palm-mute'],
        },
        { bar: 0, t: 4, duration: 4, string: 5, fret: 0, dir: 'mute' },
        { bar: 0, t: 8, duration: 8, string: 1, fret: 12 },
      ],
    },
  ],
};

describe('pieceToSchedule', () => {
  it('turns riff notes into picked events and keeps muted scratches silent', () => {
    const events = pieceToSchedule(piece, standard, 120);
    expect(events[0]).toMatchObject({ kind: 'pick', step: 0, accent: true, palmMute: true });
    expect(events[0]?.strings).toEqual([{ string: 6, midi: 43, offset: 0 }]);
    expect(events[1]).toMatchObject({ kind: 'ghost', strings: [] });
    expect(events[2]).toMatchObject({ kind: 'pick', dir: 'pick', accent: false });
    expect(events[2]?.velocity).toBeLessThan(events[0]?.velocity ?? 0);
  });

  it('writes plain-text tab', () => {
    const lines = pieceAscii(piece).split('\n');
    expect(lines).toHaveLength(6);
    expect(new Set(lines.map((line) => line.length)).size).toBe(1);
    expect(lines[0]).toMatch(/^e\|-+12-\|$/);
    expect(lines[4]).toMatch(/^A\|-+x-+\|$/);
    expect(lines[5]).toMatch(/^E\|-3-+\|$/);
  });
});
