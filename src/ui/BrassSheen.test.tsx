import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useSettingsStore } from '../app/settingsStore';
import { BrassSheen } from './BrassSheen';

afterEach(() => {
  useSettingsStore.getState().setMotion('system');
});

describe('BrassSheen', () => {
  it('renders nothing extra when never triggered', () => {
    render(
      <BrassSheen triggerKey={0}>
        <span>Target reached</span>
      </BrassSheen>,
    );
    expect(screen.queryByTestId('brass-sheen')).not.toBeInTheDocument();
  });

  it('shows the sweep once triggered', () => {
    render(
      <BrassSheen triggerKey={1}>
        <span>Target reached</span>
      </BrassSheen>,
    );
    expect(screen.getByTestId('brass-sheen')).toBeInTheDocument();
  });

  it('renders nothing with motion off', () => {
    useSettingsStore.getState().setMotion('off');
    render(
      <BrassSheen triggerKey={1}>
        <span>Target reached</span>
      </BrassSheen>,
    );
    expect(screen.queryByTestId('brass-sheen')).not.toBeInTheDocument();
  });
});
