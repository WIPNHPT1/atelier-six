import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton } from './IconButton';
import { PlayIcon } from './icons';

describe('IconButton', () => {
  it('exposes its required label for a11y', () => {
    render(
      <IconButton label="Play">
        <PlayIcon />
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
  });

  it('is keyboard activatable', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton label="Play" onClick={onClick}>
        <PlayIcon />
      </IconButton>,
    );
    const button = screen.getByRole('button', { name: 'Play' });
    button.focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
