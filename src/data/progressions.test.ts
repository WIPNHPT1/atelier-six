import { describe, expect, it } from 'vitest';
import { PROGRESSIONS } from './progressions.ts';

describe('PROGRESSIONS', () => {
  it('has a matching beatsPerChord entry for every roman step', () => {
    for (const prog of PROGRESSIONS) {
      expect(prog.beatsPerChord).toHaveLength(prog.roman.length);
    }
  });

  it('has unique ids', () => {
    const ids = PROGRESSIONS.map((prog) => prog.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes the 12-bar blues pattern', () => {
    const blues = PROGRESSIONS.find((prog) => prog.id === '12-bar-blues');
    expect(blues?.roman).toEqual(['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V']);
  });
});
