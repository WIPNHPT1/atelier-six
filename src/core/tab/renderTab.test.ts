import { describe, expect, it } from 'vitest';
import { activeColumn, durationSymbol, renderTab, toAscii } from './renderTab.ts';
import type { RhythmPreset } from '../../data/rhythms.ts';
import { parseShape } from '../shapes/parseShape.ts';
import { RHYTHMS } from '../../data/rhythms.ts';
import { standard } from '../tuning.ts';

const C = parseShape('C.open.a', 'C', 'x32010', '-32-1-');
const G = parseShape('G.open', 'G', '320003', '32---4');
const AM = parseShape('Am.open', 'Am', 'x02210', '--231-');
const F = parseShape('F.barre.e', 'F', '133211', '134211');

const drivingEighths = RHYTHMS.find((r) => r.id === 'driving-eighths');
if (!drivingEighths) throw new Error('missing driving-eighths fixture');

describe('renderTab', () => {
  it('gives one column per rhythm step per bar, tagged with its chord', () => {
    const columns = renderTab([C, G], drivingEighths, [1, 1], standard);
    expect(columns).toHaveLength(16);
    expect(columns.map((c) => c.chordIndex)).toEqual([
      ...Array<number>(8).fill(0),
      ...Array<number>(8).fill(1),
    ]);
    expect(columns.map((c) => c.step)).toEqual(Array.from({ length: 16 }, (_, i) => i));
  });

  it('repeats a chord for however many bars it holds', () => {
    const columns = renderTab([C], drivingEighths, [2], standard);
    expect(columns).toHaveLength(16);
    expect(columns.every((c) => c.chordIndex === 0)).toBe(true);
  });

  it('shows x on a muted string and the fret on a fretted or open string', () => {
    const columns = renderTab([C], drivingEighths, [1], standard);
    expect(columns[0]?.cells).toEqual(['x', '3', '2', '0', '1', '0']);
  });

  it('only fills the picked strings for a step with an explicit strings list', () => {
    const arpeggio = RHYTHMS.find((r) => r.id === 'arpeggio');
    if (!arpeggio) throw new Error('missing arpeggio fixture');
    const columns = renderTab([C], arpeggio, [1], standard);
    expect(columns[0]?.cells).toEqual([null, null, '2', null, null, null]);
  });

  it('renders a ghost step as x on every string when palm-muted, else blank', () => {
    const sixteenth = RHYTHMS.find((r) => r.id === 'sixteenth-motion');
    if (!sixteenth) throw new Error('missing sixteenth-motion fixture');
    const columns = renderTab([C], sixteenth, [1], standard);
    const ghostColumn = columns[1];
    expect(ghostColumn?.cells.every((cell) => cell === null)).toBe(true);
    expect(ghostColumn?.ghost).toBe(true);
    expect(columns[0]?.ghost).toBe(false);
  });

  it('gives every driving-eighths column an equal 2-sixteenth duration, and counts bars globally', () => {
    const columns = renderTab([C, G], drivingEighths, [1, 2], standard);
    expect(columns.every((c) => c.duration === 2)).toBe(true);
    expect(columns.map((c) => c.offset)).toEqual([
      ...[0, 2, 4, 6, 8, 10, 12, 14],
      ...[0, 2, 4, 6, 8, 10, 12, 14],
      ...[0, 2, 4, 6, 8, 10, 12, 14],
    ]);
    expect(columns.map((c) => c.bar)).toEqual([
      ...Array<number>(8).fill(0),
      ...Array<number>(8).fill(1),
      ...Array<number>(8).fill(2),
    ]);
  });

  it('derives each pop-strum note duration from the gap to the next struck step', () => {
    const popStrum = RHYTHMS.find((r) => r.id === 'pop-strum');
    if (!popStrum) throw new Error('missing pop-strum fixture');
    const columns = renderTab([C], popStrum, [1], standard);
    // steps at t = 0, 2, 3, 5, 6, 7 (eighths) -> gaps 2,1,2,1,1,1 -> *2 sixteenths
    expect(columns.map((c) => c.duration)).toEqual([4, 2, 4, 2, 2, 2]);
  });
});

describe('durationSymbol', () => {
  it('names plain note values', () => {
    expect(durationSymbol(1)).toBe('s');
    expect(durationSymbol(2)).toBe('e');
    expect(durationSymbol(4)).toBe('q');
    expect(durationSymbol(8)).toBe('h');
    expect(durationSymbol(16)).toBe('w');
  });

  it('marks dotted values', () => {
    expect(durationSymbol(3)).toBe('e.');
    expect(durationSymbol(6)).toBe('q.');
  });
});

describe('toAscii', () => {
  it('renders a 6-line tab, high e on top, for C-G-Am-F with driving-eighths', () => {
    const columns = renderTab([C, G, AM, F], drivingEighths, [1, 1, 1, 1], standard);
    const bar = (n: string) => Array<string>(8).fill(n).join('-');
    const rhythmBar = Array<string>(8).fill('e-').join('-');

    expect(toAscii(columns)).toBe(
      [
        `e|-${bar('0')}-${bar('3')}-${bar('0')}-${bar('1')}-|`,
        `B|-${bar('1')}-${bar('0')}-${bar('1')}-${bar('1')}-|`,
        `G|-${bar('0')}-${bar('0')}-${bar('2')}-${bar('2')}-|`,
        `D|-${bar('2')}-${bar('0')}-${bar('2')}-${bar('3')}-|`,
        `A|-${bar('3')}-${bar('2')}-${bar('0')}-${bar('3')}-|`,
        `E|-${bar('x')}-${bar('3')}-${bar('x')}-${bar('1')}-|`,
        `  |-${rhythmBar}-${rhythmBar}-${rhythmBar}-${rhythmBar}-|`,
      ].join('\n'),
    );
  });
});

describe('activeColumn', () => {
  it('lights the column that is sounding, on the same sixteenth clock as playback', () => {
    const rhythm: RhythmPreset = {
      id: 'eighths',
      subdivision: 8,
      steps: Array.from({ length: 8 }, (_, t) => ({ t, dir: 'D' as const })),
    };
    const columns = renderTab([C, C], rhythm, [1, 1], standard);
    expect(columns.map((c) => c.time).slice(0, 3)).toEqual([0, 2, 4]);
    expect(columns[8]?.time).toBe(16);
    // Sixteenth 17 is in bar 2's first eighth: column 8, not column 17.
    expect(activeColumn(columns, 17)).toBe(8);
    expect(activeColumn(columns, 0)).toBe(0);
    expect(activeColumn(columns, 3)).toBe(1);
    expect(activeColumn(columns, undefined)).toBe(-1);
    expect(activeColumn(columns, 99)).toBe(-1);
  });
});
