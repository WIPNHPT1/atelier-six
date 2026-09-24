import { describe, expect, it } from 'vitest';
import { MOVEMENTS, WARMUP_SECONDS, movementAt, offerHandWarmup } from './handHealth.ts';

const today = '2026-09-24';

describe('offerHandWarmup', () => {
  it('offers before downpicking stamina and long sessions, once a day', () => {
    expect(
      offerHandWarmup({ lessonId: 'power-stamina', minutesToday: 0, lastWarmup: '', today }),
    ).toBe(true);
    expect(
      offerHandWarmup({ lessonId: 'open-c-am', minutesToday: 10, lastWarmup: '', today }),
    ).toBe(false);
    expect(offerHandWarmup({ minutesToday: 31, lastWarmup: '2026-09-23', today })).toBe(true);
    expect(
      offerHandWarmup({ lessonId: 'power-stamina', minutesToday: 45, lastWarmup: today, today }),
    ).toBe(false);
  });
});

describe('movementAt', () => {
  it('steps through each movement over two minutes', () => {
    expect(movementAt(0)).toBe(MOVEMENTS[0]);
    expect(movementAt(-5)).toBe(MOVEMENTS[0]);
    expect(movementAt(WARMUP_SECONDS - 1)).toBe(MOVEMENTS.at(-1));
    expect(movementAt(WARMUP_SECONDS)).toBeNull();
    expect(new Set(Array.from({ length: 120 }, (_, s) => movementAt(s))).size).toBe(
      MOVEMENTS.length,
    );
  });
});
