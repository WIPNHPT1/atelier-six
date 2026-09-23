import { transpose, noteName, type PitchClass } from './pitch.ts';

export type ChordQuality = 'maj' | 'min' | '5' | 'dim' | '7' | 'sus2' | 'sus4' | 'add9' | 'm7';

export type ChordSpec = {
  root: PitchClass;
  quality: ChordQuality;
};

const DEGREE_SEMITONES: Record<string, number> = {
  i: 0,
  ii: 2,
  iii: 4,
  iv: 5,
  v: 7,
  vi: 9,
  vii: 11,
};

const ROMAN_PATTERN = /^(b)?(vii|vi|iv|v|iii|ii|i)(°|5)?$/i;

export function romanToChord(roman: string, keyPc: PitchClass): ChordSpec {
  const match = ROMAN_PATTERN.exec(roman);
  if (!match) {
    throw new Error(`Unrecognised roman numeral: ${roman}`);
  }

  const flat = match[1];
  const numeral = match[2] as string;
  const suffix = match[3];
  const lower = numeral.toLowerCase();
  const semitones = DEGREE_SEMITONES[lower] as number;
  const root = transpose(keyPc, semitones - (flat ? 1 : 0));

  let quality: ChordQuality;
  if (suffix === '5') {
    quality = '5';
  } else if (suffix === '°') {
    quality = 'dim';
  } else {
    quality = numeral === lower ? 'min' : 'maj';
  }

  return { root, quality };
}

const QUALITY_SUFFIX: Record<ChordQuality, string> = {
  maj: '',
  min: 'm',
  '5': '5',
  dim: 'dim',
  '7': '7',
  sus2: 'sus2',
  sus4: 'sus4',
  add9: 'add9',
  m7: 'm7',
};

export function chordName({ root, quality }: ChordSpec): string {
  return `${noteName(root)}${QUALITY_SUFFIX[quality]}`;
}
