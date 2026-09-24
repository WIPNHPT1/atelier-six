import { describe, expect, it } from 'vitest';
import { parseCommand, type VoiceAction } from './parseCommand';

describe('parseCommand', () => {
  const table: [string, VoiceAction | null][] = [
    ['play', { type: 'play' }],
    ['Start', { type: 'play' }],
    ['stop', { type: 'stop' }],
    ['pause', { type: 'stop' }],
    ['slower', { type: 'slower' }],
    ['slow down', { type: 'slower' }],
    ['faster', { type: 'faster' }],
    ['speed up', { type: 'faster' }],
    ['loop', { type: 'toggleLoop' }],
    ['next', { type: 'next' }],
    ['back', { type: 'prev' }],
    ['previous', { type: 'prev' }],
    ['tempo 90', { type: 'tempo', bpm: 90 }],
    ['nonsense', null],
    ['', null],
  ];

  for (const [transcript, action] of table) {
    it(`parses "${transcript}"`, () => {
      expect(parseCommand(transcript)).toEqual(action);
    });
  }

  it('is case and whitespace tolerant', () => {
    expect(parseCommand('  SLOW   DOWN  ')).toEqual({ type: 'slower' });
    expect(parseCommand('TEMPO 120')).toEqual({ type: 'tempo', bpm: 120 });
  });
});
