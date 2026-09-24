import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Divider } from './Divider';

describe('Divider', () => {
  it('renders a separator', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('supports a vertical orientation', () => {
    render(<Divider orientation="vertical" data-testid="divider" />);
    expect(screen.getByTestId('divider').className).toMatch(/vertical/);
  });
});
