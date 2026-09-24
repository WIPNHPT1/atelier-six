import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  it('renders as a labelled switch reflecting its state', () => {
    render(<Toggle label="Sound" checked={false} onChange={vi.fn()} />);
    const toggle = screen.getByRole('switch', { name: 'Sound' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('toggles on click and on keyboard activation', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle label="Sound" checked={false} onChange={onChange} />);
    const toggle = screen.getByRole('switch', { name: 'Sound' });
    await user.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
