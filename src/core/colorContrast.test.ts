import { describe, expect, it } from 'vitest';
import { contrastRatio } from './colorContrast';

describe('contrastRatio', () => {
  it('returns 1 for identical colours', () => {
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });

  it('returns 21 for black against white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('is order independent', () => {
    const a = contrastRatio('#121110', '#efeae1');
    const b = contrastRatio('#efeae1', '#121110');
    expect(a).toBeCloseTo(b, 10);
  });
});
