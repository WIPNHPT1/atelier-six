import { describe, expect, it } from 'vitest';
import { freqToMidi, midiToFreq, noteName, parseNote, transpose } from './pitch.ts';

describe('noteName', () => {
  it('names every pitch class with sharps by default', () => {
    const expected = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    expected.forEach((name, pc) => {
      expect(noteName(pc)).toBe(name);
    });
  });

  it('names every pitch class with flats when requested', () => {
    const expected = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    expected.forEach((name, pc) => {
      expect(noteName(pc, true)).toBe(name);
    });
  });

  it('wraps out-of-range pitch classes', () => {
    expect(noteName(12)).toBe('C');
    expect(noteName(-1)).toBe('B');
  });
});

describe('parseNote', () => {
  it('parses naturals, sharps, flats and enharmonic spellings', () => {
    expect(parseNote('C')).toBe(0);
    expect(parseNote('B#')).toBe(0);
    expect(parseNote('C#')).toBe(1);
    expect(parseNote('Db')).toBe(1);
    expect(parseNote('D')).toBe(2);
    expect(parseNote('D#')).toBe(3);
    expect(parseNote('Eb')).toBe(3);
    expect(parseNote('E')).toBe(4);
    expect(parseNote('Fb')).toBe(4);
    expect(parseNote('F')).toBe(5);
    expect(parseNote('E#')).toBe(5);
    expect(parseNote('F#')).toBe(6);
    expect(parseNote('Gb')).toBe(6);
    expect(parseNote('G')).toBe(7);
    expect(parseNote('G#')).toBe(8);
    expect(parseNote('Ab')).toBe(8);
    expect(parseNote('A')).toBe(9);
    expect(parseNote('A#')).toBe(10);
    expect(parseNote('Bb')).toBe(10);
    expect(parseNote('B')).toBe(11);
    expect(parseNote('Cb')).toBe(11);
  });

  it('trims surrounding whitespace', () => {
    expect(parseNote(' F# ')).toBe(6);
  });

  it('throws on an unknown note name', () => {
    expect(() => parseNote('H')).toThrow('Unknown note name: H');
  });
});

describe('transpose', () => {
  it('shifts a pitch class by semitones and wraps within an octave', () => {
    expect(transpose(0, 1)).toBe(1);
    expect(transpose(11, 1)).toBe(0);
    expect(transpose(0, -1)).toBe(11);
    expect(transpose(0, 12)).toBe(0);
    expect(transpose(0, 0)).toBe(0);
  });
});

describe('midiToFreq / freqToMidi', () => {
  it('converts A4 (midi 69) to 440 Hz', () => {
    expect(midiToFreq(69)).toBeCloseTo(440);
  });

  it('round-trips midi -> freq -> midi', () => {
    for (let midi = 40; midi <= 80; midi++) {
      expect(freqToMidi(midiToFreq(midi))).toBeCloseTo(midi, 10);
    }
  });

  it('honours a custom reference pitch', () => {
    expect(midiToFreq(69, 432)).toBeCloseTo(432);
    expect(freqToMidi(432, 432)).toBeCloseTo(69, 10);
  });
});
