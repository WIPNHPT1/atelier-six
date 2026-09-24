import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LibraryPage from './LibraryPage';
import { copy } from '../../content/copy.en-GB';

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
});
