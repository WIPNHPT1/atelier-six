import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pill } from './Pill';

describe('Pill', () => {
  it('renders its children', () => {
    render(<Pill>New</Pill>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('supports an accent style', () => {
    render(
      <Pill accent data-testid="pill">
        New
      </Pill>,
    );
    expect(screen.getByTestId('pill').className).toMatch(/accent/);
  });
});
