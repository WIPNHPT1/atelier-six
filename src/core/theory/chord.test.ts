import { describe, expect, it } from 'vitest';
import { noteName, transpose } from './pitch.ts';
import { chordName, romanToChord } from './chord.ts';

const DEGREES = [
  { upper: 'I', lower: 'i', semitones: 0 },
  { upper: 'II', lower: 'ii', semitones: 2 },
  { upper: 'III', lower: 'iii', semitones: 4 },
  { upper: 'IV', lower: 'iv', semitones: 5 },
  { upper: 'V', lower: 'v', semitones: 7 },
  { upper: 'VI', lower: 'vi', semitones: 9 },
  { upper: 'VII', lower: 'vii', semitones: 11 },
];

describe('romanToChord', () => {
  it('resolves every degree, in every key, for both cases', () => {
    for (let keyPc = 0; keyPc < 12; keyPc++) {
      for (const { upper, lower, semitones } of DEGREES) {
        const majorChord = romanToChord(upper, keyPc);
        expect(majorChord).toEqual({ root: transpose(keyPc, semitones), quality: 'maj' });

        const minorChord = romanToChord(lower, keyPc);
        expect(minorChord).toEqual({ root: transpose(keyPc, semitones), quality: 'min' });
      }
    }
  });

  it('parses the diatonic vii° as diminished', () => {
    expect(romanToChord('vii°', 0)).toEqual({ root: 11, quality: 'dim' });
    expect(romanToChord('VII°', 0)).toEqual({ root: 11, quality: 'dim' });
  });

  it('parses a flat-VII as a major chord a whole tone below the octave', () => {
    expect(romanToChord('bVII', 0)).toEqual({ root: 10, quality: 'maj' });
  });

  it('parses power-chord suffixes', () => {
    expect(romanToChord('I5', 0)).toEqual({ root: 0, quality: '5' });
    expect(romanToChord('IV5', 0)).toEqual({ root: 5, quality: '5' });
  });

  it('throws on an unrecognised roman numeral', () => {
    expect(() => romanToChord('IX', 0)).toThrow('Unrecognised roman numeral: IX');
  });
});

describe('chordName', () => {
  it('names chords of every quality', () => {
    expect(chordName({ root: 9, quality: 'min' })).toBe('Am');
    expect(chordName({ root: 7, quality: '5' })).toBe('G5');
    expect(chordName({ root: 0, quality: 'add9' })).toBe('Cadd9');
    expect(chordName({ root: 0, quality: 'maj' })).toBe('C');
    expect(chordName({ root: 0, quality: 'dim' })).toBe('Cdim');
    expect(chordName({ root: 0, quality: '7' })).toBe('C7');
    expect(chordName({ root: 0, quality: 'sus2' })).toBe('Csus2');
    expect(chordName({ root: 0, quality: 'sus4' })).toBe('Csus4');
    expect(chordName({ root: 0, quality: 'm7' })).toBe('Cm7');
  });

  it('round-trips every diatonic degree, in every key, through romanToChord', () => {
    for (let keyPc = 0; keyPc < 12; keyPc++) {
      for (const { upper, semitones } of DEGREES) {
        const chord = romanToChord(upper, keyPc);
        expect(chordName(chord)).toBe(noteName(transpose(keyPc, semitones)));
      }
    }
  });
});
