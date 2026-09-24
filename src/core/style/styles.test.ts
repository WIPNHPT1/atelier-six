import { describe, expect, it } from 'vitest';
import { STYLES } from '../../data/styles/index.ts';
import { romanToChord } from '../theory/chord.ts';

describe('style sheets', () => {
  for (const [id, style] of Object.entries(STYLES)) {
    it(`${id} has usable building blocks`, () => {
      expect(style.id).toBe(id);
      expect(style.tempo.min).toBeLessThan(style.tempo.max);
      expect(style.rhythmCells.some((cell) => cell.level === 1)).toBe(true);
      const accentSteps = style.mustInclude.flatMap((rule) =>
        rule.kind === 'accentOn' ? rule.steps : [],
      );
      for (const cell of style.rhythmCells) {
        const times = cell.steps.map((step) => step.t);
        expect(times[0]).toBe(0);
        expect(times).toEqual([...times].sort((a, b) => a - b));
        expect(times.every((t) => t >= 0 && t < 16)).toBe(true);
        if (style.feel.subdivision === 8) expect(times.every((t) => t % 2 === 0)).toBe(true);
        if (style.feel.downstrokesOnly)
          expect(cell.steps.every((step) => step.dir !== 'U')).toBe(true);
        for (const step of accentSteps) expect(times).toContain(step);
        if (style.mustInclude.some((rule) => rule.kind === 'push')) expect(times).toContain(14);
      }
      for (const progression of style.progressions) {
        expect(() => progression.roman.map((roman) => romanToChord(roman, 0))).not.toThrow();
      }
      expect(style.phraseShapes.length).toBeGreaterThan(0);
    });
  }
});
