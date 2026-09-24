import { describe, expect, it } from 'vitest';
import { initAutoAdvance, startListening, stopListening, tickAutoAdvance } from './autoAdvance';

describe('autoAdvance', () => {
  it('starts idle', () => {
    expect(initAutoAdvance()).toEqual({ state: 'idle', heardSince: null });
  });

  it('idle ignores ticks', () => {
    const context = initAutoAdvance();
    expect(tickAutoAdvance(context, true, 0)).toBe(context);
  });

  it('startListening moves to listening', () => {
    expect(startListening()).toEqual({ state: 'listening', heardSince: null });
  });

  it('stopListening returns to idle', () => {
    expect(stopListening()).toEqual({ state: 'idle', heardSince: null });
  });

  it('advances after the root is held for the full 250ms window', () => {
    let context = startListening();
    context = tickAutoAdvance(context, true, 1000);
    expect(context.state).toBe('heard');
    context = tickAutoAdvance(context, true, 1150);
    expect(context.state).toBe('heard');
    context = tickAutoAdvance(context, true, 1250);
    expect(context.state).toBe('advanced');
  });

  it('stays advanced and ignores further ticks until reset', () => {
    let context = startListening();
    context = tickAutoAdvance(context, true, 0);
    context = tickAutoAdvance(context, true, 250);
    expect(context.state).toBe('advanced');
    const advanced = context;
    context = tickAutoAdvance(context, true, 500);
    expect(context).toBe(advanced);
    context = tickAutoAdvance(context, false, 500);
    expect(context).toBe(advanced);
  });

  it('resets the hold when the root is interrupted before 250ms', () => {
    let context = startListening();
    context = tickAutoAdvance(context, true, 0);
    context = tickAutoAdvance(context, false, 100);
    expect(context).toEqual({ state: 'listening', heardSince: null });
    context = tickAutoAdvance(context, true, 150);
    expect(context.state).toBe('heard');
    // The hold restarted at 150ms, so 250ms after the original hit isn't enough yet.
    context = tickAutoAdvance(context, true, 250);
    expect(context.state).toBe('heard');
    context = tickAutoAdvance(context, true, 400);
    expect(context.state).toBe('advanced');
  });

  it('staying unmatched in listening keeps resetting heardSince', () => {
    let context = startListening();
    context = tickAutoAdvance(context, false, 0);
    expect(context).toEqual({ state: 'listening', heardSince: null });
  });
});
