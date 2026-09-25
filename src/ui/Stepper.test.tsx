import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Stepper } from './Stepper';

describe('Stepper', () => {
  it('renders the formatted value between labelled buttons', () => {
    render(
      <Stepper
        label="Tempo"
        decrementLabel="Slower"
        incrementLabel="Faster"
        value={96}
        min={40}
        max={200}
        onChange={vi.fn()}
        format={(bpm) => `${String(bpm)} BPM`}
      />,
    );
    expect(screen.getByRole('group', { name: 'Tempo' })).toBeInTheDocument();
    expect(screen.getByText('96 BPM')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Slower' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Faster' })).toBeInTheDocument();
  });

  it('nudges the value by step on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Stepper
        label="Tempo"
        decrementLabel="Slower"
        incrementLabel="Faster"
        value={96}
        min={40}
        max={200}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Faster' }));
    expect(onChange).toHaveBeenLastCalledWith(97);
    await user.click(screen.getByRole('button', { name: 'Slower' }));
    expect(onChange).toHaveBeenLastCalledWith(96);
  });

  it('disables the decrement button at the minimum and increment at the maximum', () => {
    const { rerender } = render(
      <Stepper
        label="Tempo"
        decrementLabel="Slower"
        incrementLabel="Faster"
        value={40}
        min={40}
        max={200}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Slower' })).toBeDisabled();

    rerender(
      <Stepper
        label="Tempo"
        decrementLabel="Slower"
        incrementLabel="Faster"
        value={200}
        min={40}
        max={200}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Faster' })).toBeDisabled();
  });
});
