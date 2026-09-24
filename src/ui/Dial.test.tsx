import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dial } from './Dial';

describe('Dial', () => {
  it('renders a labelled progressbar reflecting its value', () => {
    render(<Dial label="Practice ring" value={0.5} />);
    const dial = screen.getByRole('progressbar', { name: 'Practice ring' });
    expect(dial).toHaveAttribute('aria-valuenow', '50');
  });

  it('shows an optional display value', () => {
    render(<Dial label="Tuner" value={0.5} displayValue="A" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('clamps out-of-range values', () => {
    render(<Dial label="Practice ring" value={1.4} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
});
