import { describe, expect, it } from 'vitest';
import { smooth } from './smooth';

describe('smooth', () => {
  it('moves partway from prev toward next', () => {
    expect(smooth(0, 10, 0.5)).toBe(5);
  });

  it('returns prev unchanged when alpha is 0', () => {
    expect(smooth(3, 100, 0)).toBe(3);
  });

  it('returns next unchanged when alpha is 1', () => {
    expect(smooth(3, 100, 1)).toBe(100);
  });
});
