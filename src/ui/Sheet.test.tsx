import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sheet } from './Sheet';

describe('Sheet', () => {
  it('renders nothing when closed', () => {
    render(
      <Sheet title="Practise" open={false} onClose={vi.fn()}>
        Content
      </Sheet>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders a labelled dialog with its content when open', () => {
    render(
      <Sheet title="Practise" open onClose={vi.fn()}>
        Content
      </Sheet>,
    );
    expect(screen.getByRole('dialog', { name: 'Practise' })).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('closes on the close button, backdrop click and Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Sheet title="Practise" open onClose={onClose}>
        Content
      </Sheet>,
    );
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
