import { describe, expect, it } from 'vitest';
import { freqToNote, midiToNote } from './freqToNote';

const A4 = 440;

function freqForMidi(midi: number, centsOffset = 0): number {
  return A4 * Math.pow(2, (midi + centsOffset / 100 - 69) / 12);
}

// Standard tuning MIDI notes (low E to high e), drop-D low D, and half-step-down tuning.
const STRING_MIDIS = [40, 45, 50, 55, 59, 64, 38, 39, 44, 49, 54, 58, 63];
const CENT_OFFSETS = [0, 10, -10, 30, -30];

describe('freqToNote', () => {
  for (const midi of STRING_MIDIS) {
    for (const centsOffset of CENT_OFFSETS) {
      it(`resolves midi ${String(midi)} at ${String(centsOffset)} cents`, () => {
        const note = freqToNote(freqForMidi(midi, centsOffset));
        expect(note.midi).toBe(midi);
        expect(note.cents).toBeCloseTo(centsOffset, 0);
      });
    }
  }

  it('names notes correctly', () => {
    expect(freqToNote(freqForMidi(69)).name).toBe('A');
    expect(freqToNote(freqForMidi(60)).name).toBe('C');
    expect(freqToNote(freqForMidi(61)).name).toBe('C#');
  });

  it('computes octave using MIDI 60 = C4', () => {
    expect(freqToNote(freqForMidi(60)).octave).toBe(4);
    expect(freqToNote(freqForMidi(40)).octave).toBe(2);
  });

  it('midiToNote agrees with freqToNote on name and octave', () => {
    expect(midiToNote(40)).toEqual({ name: 'E', octave: 2 });
    expect(midiToNote(45)).toEqual({ name: 'A', octave: 2 });
  });

  it('respects a custom A4 calibration', () => {
    const note = freqToNote(freqForMidi(69, 0) + 0, 440);
    expect(note.cents).toBeCloseTo(0, 0);
    const shifted = freqToNote(430 * Math.pow(2, (69 - 69) / 12), 430);
    expect(shifted.midi).toBe(69);
    expect(shifted.cents).toBeCloseTo(0, 0);
  });
});
