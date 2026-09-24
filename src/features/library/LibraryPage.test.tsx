import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LibraryPage from './LibraryPage';
import { copy } from '../../content/copy.en-GB';

vi.mock('../../audio/hearChord', () => ({
  hearChord: vi.fn().mockResolvedValue(undefined),
}));

function renderPage() {
  return render(<LibraryPage />);
}

describe('LibraryPage', () => {
  it('shows power-chord cards by default', () => {
    renderPage();
    expect(screen.getByText('G5')).toBeInTheDocument();
  });

  it('switches to the Open tab and opens a chord sheet with its shapes', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('radio', { name: copy.library.moduleOpen }));
    await user.click(screen.getByText('G'));

    const dialog = screen.getByRole('dialog', { name: 'G' });
    expect(within(dialog).getAllByTestId('chord-shape')).toHaveLength(3);
  });

  it('filters the grid by search text', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText(copy.library.searchPlaceholder), 'g5');
    expect(screen.getByText('G5')).toBeInTheDocument();
    expect(screen.queryByText('A5')).not.toBeInTheDocument();
  });

  it('shows disabled module pills marked coming in v1.1', () => {
    renderPage();
    expect(screen.getByText(/Thumb-over.*Coming in v1\.1/)).toBeInTheDocument();
  });

  it('strums a shape once when its Hear chord button is clicked', async () => {
    const { hearChord } = await import('../../audio/hearChord');
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('G5'));
    const dialog = screen.getByRole('dialog', { name: 'G5' });
    await user.click(within(dialog).getAllByText(copy.library.hearChord)[0] as HTMLElement);

    expect(hearChord).toHaveBeenCalledTimes(1);
  });
});
