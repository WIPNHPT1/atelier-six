import { describe, expect, it } from 'vitest';
import { resolveProgression } from './progression.ts';
import { parseNote } from './theory/pitch.ts';

describe('resolveProgression', () => {
  it('resolves I-V-vi-IV in G to G, D, Em, C', () => {
    const prog = { roman: ['I', 'V', 'vi', 'IV'] };
    expect(resolveProgression(prog, parseNote('G'))).toEqual(['G', 'D', 'Em', 'C']);
  });

  it('resolves I-V-vi-IV in C as power chords to C5, G5, A5, F5', () => {
    const prog = { roman: ['I', 'V', 'vi', 'IV'] };
    expect(resolveProgression(prog, parseNote('C'), { power: true })).toEqual([
      'C5',
      'G5',
      'A5',
      'F5',
    ]);
  });

  it('resolves ii-V-I in C to Dm, G, C', () => {
    const prog = { roman: ['ii', 'V', 'I'] };
    expect(resolveProgression(prog, parseNote('C'))).toEqual(['Dm', 'G', 'C']);
  });
});
