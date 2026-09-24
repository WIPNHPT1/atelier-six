import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders Atelier Six', async () => {
    render(<App />);
    expect(screen.getByTestId('logo-wordmark')).toHaveTextContent('Atelier Six');
    // The shell lazy-loads lesson and chord commands; let that finish before teardown.
    await vi.dynamicImportSettled();
  });
});
