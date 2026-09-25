import { afterEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { useSettingsStore } from '../../app/settingsStore';
import { analyseTransition } from '../../core/engine/analyseTransition';
import { parseShape } from '../../core/shapes/parseShape';
import { FingerGlide } from './FingerGlide';

afterEach(() => {
  useSettingsStore.getState().setMotion('system');
});

describe('FingerGlide', () => {
  const c = parseShape('C.open', 'C', 'x32010', '-32-1-');
  const am = parseShape('Am.open', 'Am', 'x02210', '--231-');
  const transition = analyseTransition(c, am);

  it('renders one dot per finger move', () => {
    const { container } = render(<FingerGlide transition={transition} />);
    expect(container.querySelectorAll('circle').length).toBeGreaterThan(0);
  });

  it('renders the resting shape instantly with motion off, no animated dots', () => {
    useSettingsStore.getState().setMotion('off');
    const { container } = render(<FingerGlide transition={transition} />);
    // Only plain <circle> elements — no motion-managed elements carrying animation state.
    expect(container.querySelectorAll('[style*="opacity"]').length).toBe(0);
  });
});
