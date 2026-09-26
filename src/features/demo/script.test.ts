import { describe, expect, it } from 'vitest';
import { demoScript, settleCents, SETTLE_START_CENTS, totalMs } from './script';

describe('demoScript', () => {
  it('fits a 20-second tour and ends on the tuner', () => {
    const total = totalMs(demoScript);
    expect(total).toBeGreaterThan(15_000);
    expect(total).toBeLessThanOrEqual(21_000);
    const last = demoScript[demoScript.length - 1];
    expect(last).toMatchObject({ kind: 'go', path: '/tuner' });
  });

  it('switches through three finishes', () => {
    const finishes = demoScript.flatMap((s) => (s.kind === 'finish' ? [s.finish] : []));
    expect(finishes).toEqual(['nitro', 'xerox', 'sunburst']);
  });
});

describe('settleCents', () => {
  it('eases from sharp to centre and stays there', () => {
    expect(settleCents(0)).toBe(SETTLE_START_CENTS);
    expect(settleCents(-5)).toBe(SETTLE_START_CENTS);
    expect(settleCents(900)).toBeGreaterThan(0);
    expect(settleCents(900)).toBeLessThan(SETTLE_START_CENTS / 2);
    expect(settleCents(5000)).toBe(0);
  });
});
