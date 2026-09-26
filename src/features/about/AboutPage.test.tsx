import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AboutPage from './AboutPage';
import { copy } from '../../content/copy.en-GB';

afterEach(cleanup);

describe('AboutPage', () => {
  it('shows the case-study sections and the not-affiliated line', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: copy.about.engineHeading })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: copy.about.privacyHeading })).toBeInTheDocument();
    expect(screen.getByText(copy.about.notAffiliated)).toBeInTheDocument();
  });

  it('redraws the lattice when a chord is picked', async () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('img', { name: /G and C/ })).toBeInTheDocument();
    const second = screen.getByRole('radiogroup', { name: copy.about.toChord });
    const d = Array.from(second.querySelectorAll('button')).find((b) => b.textContent === 'D');
    if (d === undefined) throw new Error('no D segment');
    await userEvent.click(d);
    expect(screen.getByRole('img', { name: /G and D/ })).toBeInTheDocument();
  });
});
