import { afterEach, describe, expect, it, vi } from 'vitest';
import { vibrate } from './haptics';

describe('vibrate', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'vibrate');
  });

  it('calls navigator.vibrate when supported', () => {
    const spy = vi.fn();
    Object.defineProperty(navigator, 'vibrate', { value: spy, configurable: true });
    vibrate(15);
    expect(spy).toHaveBeenCalledWith(15);
  });

  it('does nothing where unsupported', () => {
    Reflect.deleteProperty(navigator, 'vibrate');
    expect(() => {
      vibrate(15);
    }).not.toThrow();
  });
});
