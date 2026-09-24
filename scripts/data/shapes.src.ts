import { chordName } from '../../src/core/theory/chord.ts';
import { type PitchClass } from '../../src/core/theory/pitch.ts';
import type { Shape } from '../../src/core/shapes/types.ts';

export type RawShape = {
  id: string;
  chord: string;
  frets: string;
  fingers: string;
  tags: string[];
  barre?: Shape['barre'];
};

const OPEN: RawShape[] = [
  { id: 'E.open', chord: 'E', frets: '022100', fingers: '-231--', tags: ['open'] },
  { id: 'A.open.a', chord: 'A', frets: 'x02220', fingers: '--123-', tags: ['open'] },
  { id: 'A.open.b', chord: 'A', frets: 'x02220', fingers: '--213-', tags: ['open'] },
  { id: 'D.open', chord: 'D', frets: 'xx0232', fingers: '---132', tags: ['open'] },
  { id: 'G.open.a', chord: 'G', frets: '320003', fingers: '21---3', tags: ['open'] },
  { id: 'G.open.b', chord: 'G', frets: '320003', fingers: '32---4', tags: ['open'] },
  { id: 'C.open.a', chord: 'C', frets: 'x32010', fingers: '-32-1-', tags: ['open'] },
  { id: 'Am.open', chord: 'Am', frets: 'x02210', fingers: '--231-', tags: ['open'] },
  { id: 'Em.open.a', chord: 'Em', frets: '022000', fingers: '-23---', tags: ['open'] },
  { id: 'Em.open.b', chord: 'Em', frets: '022000', fingers: '-12---', tags: ['open'] },
  { id: 'Dm.open', chord: 'Dm', frets: 'xx0231', fingers: '---231', tags: ['open'] },
  { id: 'E7.open', chord: 'E7', frets: '020100', fingers: '-2-1--', tags: ['open'] },
  { id: 'A7.open', chord: 'A7', frets: 'x02020', fingers: '--2-3-', tags: ['open'] },
  { id: 'D7.open', chord: 'D7', frets: 'xx0212', fingers: '---213', tags: ['open'] },
];

const ANCHORED: RawShape[] = [
  { id: 'Em7.anchored', chord: 'Em7', frets: '022033', fingers: '-12-34', tags: ['anchored'] },
  { id: 'G.anchored', chord: 'G', frets: '320033', fingers: '21--34', tags: ['anchored'] },
  { id: 'Dsus4.anchored', chord: 'Dsus4', frets: 'xx0233', fingers: '---134', tags: ['anchored'] },
  {
    id: 'A7sus4.anchored',
    chord: 'A7sus4',
    frets: 'x02033',
    fingers: '--1-34',
    tags: ['anchored'],
  },
  { id: 'Cadd9.anchored', chord: 'Cadd9', frets: 'x32033', fingers: '-21-34', tags: ['anchored'] },
];

const OPEN_POWER: RawShape[] = [
  { id: 'E5.open', chord: 'E5', frets: '022xxx', fingers: '-12---', tags: ['power'] },
  { id: 'A5.open', chord: 'A5', frets: 'x022xx', fingers: '--12--', tags: ['power'] },
];

const OPEN_E_STRING_PC: PitchClass = 4;
const OPEN_A_STRING_PC: PitchClass = 9;

function rootFret(root: PitchClass, openStringPc: PitchClass): number {
  const r = (((root - openStringPc) % 12) + 12) % 12;
  return r === 0 ? 12 : r;
}

function formatFret(fret: number): string {
  return fret >= 10 ? `(${String(fret)})` : String(fret);
}

function fretsString(values: Array<number | null>): string {
  return values.map((value) => (value === null ? 'x' : formatFret(value))).join('');
}

function generateBarreShapes(): RawShape[] {
  const shapes: RawShape[] = [];

  for (let root = 0; root < 12; root++) {
    const pc: PitchClass = root;
    const rE = rootFret(pc, OPEN_E_STRING_PC);
    const rA = rootFret(pc, OPEN_A_STRING_PC);
    const majorName = chordName({ root: pc, quality: 'maj' });
    const minorName = chordName({ root: pc, quality: 'min' });

    shapes.push({
      id: `${majorName}.barre.e`,
      chord: majorName,
      frets: fretsString([rE, rE + 2, rE + 2, rE + 1, rE, rE]),
      fingers: '134211',
      tags: ['barre'],
      barre: { fret: rE, from: 0, to: 5, finger: 1 },
    });
    shapes.push({
      id: `${minorName}.barre.e`,
      chord: minorName,
      frets: fretsString([rE, rE + 2, rE + 2, rE, rE, rE]),
      fingers: '134111',
      tags: ['barre'],
      barre: { fret: rE, from: 0, to: 5, finger: 1 },
    });
    shapes.push({
      id: `${majorName}.barre.a`,
      chord: majorName,
      frets: fretsString([null, rA, rA + 2, rA + 2, rA + 2, rA]),
      fingers: '-12341',
      tags: ['barre'],
      barre: { fret: rA, from: 1, to: 5, finger: 1 },
    });
    shapes.push({
      id: `${minorName}.barre.a`,
      chord: minorName,
      frets: fretsString([null, rA, rA + 2, rA + 2, rA + 1, rA]),
      fingers: '-13421',
      tags: ['barre'],
      barre: { fret: rA, from: 1, to: 5, finger: 1 },
    });
  }

  return shapes;
}

function generatePowerShapes(): RawShape[] {
  const shapes: RawShape[] = [];

  for (let root = 0; root < 12; root++) {
    const pc: PitchClass = root;
    const rE = rootFret(pc, OPEN_E_STRING_PC);
    const rA = rootFret(pc, OPEN_A_STRING_PC);
    const name = chordName({ root: pc, quality: '5' });

    shapes.push({
      id: `${name}.power.2.e`,
      chord: name,
      frets: fretsString([rE, rE + 2, null, null, null, null]),
      fingers: '13----',
      tags: ['power'],
    });
    shapes.push({
      id: `${name}.power.3.e`,
      chord: name,
      frets: fretsString([rE, rE + 2, rE + 2, null, null, null]),
      fingers: '134---',
      tags: ['power'],
    });
    shapes.push({
      id: `${name}.power.oct.e`,
      chord: name,
      frets: fretsString([rE, null, rE + 2, null, null, null]),
      fingers: '1-4---',
      tags: ['power', 'octave'],
    });
    shapes.push({
      id: `${name}.power.2.a`,
      chord: name,
      frets: fretsString([null, rA, rA + 2, null, null, null]),
      fingers: '-13---',
      tags: ['power'],
    });
    shapes.push({
      id: `${name}.power.3.a`,
      chord: name,
      frets: fretsString([null, rA, rA + 2, rA + 2, null, null]),
      fingers: '-134--',
      tags: ['power'],
    });
    shapes.push({
      id: `${name}.power.oct.a`,
      chord: name,
      frets: fretsString([null, rA, null, rA + 2, null, null]),
      fingers: '-1-4--',
      tags: ['power', 'octave'],
    });
  }

  return shapes;
}

export const SHAPES: RawShape[] = [
  ...OPEN,
  ...ANCHORED,
  ...generateBarreShapes(),
  ...generatePowerShapes(),
  ...OPEN_POWER,
];
