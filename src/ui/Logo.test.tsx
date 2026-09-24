import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from './Logo';

describe('Logo', () => {
  it('renders exactly two letter paths plus the brass line', () => {
    const { container } = render(<Logo variant="mark" />);
    expect(container.querySelectorAll('path')).toHaveLength(2);
    expect(container.querySelector('[data-testid="logo-line-brass"]')).toBeInTheDocument();
  });

  it('is labelled for accessibility', () => {
    render(<Logo variant="mark" title="Atelier Six" />);
    expect(screen.getByRole('img', { name: 'Atelier Six' })).toBeInTheDocument();
  });

  it('adds the wordmark for the lockup variant', () => {
    render(<Logo variant="lockup" size={40} />);
    expect(screen.getByTestId('logo-wordmark')).toHaveTextContent('Atelier Six');
  });

  it('switches to the small drawing below 32px even for other variants', () => {
    const { container } = render(<Logo variant="lockup" size={24} />);
    expect(container.querySelector('[data-testid="logo-small"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="logo-mark"]')).not.toBeInTheDocument();
  });

  it('uses the small drawing when variant is small', () => {
    const { container } = render(<Logo variant="small" size={64} />);
    expect(container.querySelector('[data-testid="logo-small"]')).toBeInTheDocument();
  });
});
