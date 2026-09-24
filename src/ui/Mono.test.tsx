import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Mono } from './Mono';

describe('Mono', () => {
  it('renders its children in a monospace, tabular-figure span', () => {
    render(<Mono>120 BPM</Mono>);
    const el = screen.getByText('120 BPM');
    expect(el.tagName).toBe('SPAN');
  });
});
