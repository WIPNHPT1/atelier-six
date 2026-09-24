import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetronomeControl } from './MetronomeControl';
import { copy } from '../../content/copy.en-GB';

function baseProps() {
  return {
    bpm: 100,
    setBpm: vi.fn(),
    isOn: false,
    toggle: vi.fn(),
    countInBars: 1,
    setCountInBars: vi.fn(),
    tap: vi.fn(),
  };
}

describe('MetronomeControl', () => {
  it('shows the start label when off and calls toggle on click', async () => {
    const user = userEvent.setup();
    const props = baseProps();
    render(<MetronomeControl {...props} />);

    const toggleButton = screen.getByRole('button', { name: copy.metronome.start });
    await user.click(toggleButton);

    expect(props.toggle).toHaveBeenCalledTimes(1);
  });

  it('shows the stop label and pressed state when on', () => {
    render(<MetronomeControl {...baseProps()} isOn />);
    const toggleButton = screen.getByRole('button', { name: copy.metronome.stop });
    expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls setBpm with the entered tempo', () => {
    const props = baseProps();
    render(<MetronomeControl {...props} />);

    const bpmField = screen.getByLabelText(copy.metronome.bpmLabel);
    fireEvent.change(bpmField, { target: { value: '90' } });

    expect(props.setBpm).toHaveBeenCalledWith(90);
  });

  it('calls tap when the tap-tempo button is clicked', async () => {
    const user = userEvent.setup();
    const props = baseProps();
    render(<MetronomeControl {...props} />);

    await user.click(screen.getByRole('button', { name: copy.metronome.tap }));

    expect(props.tap).toHaveBeenCalledTimes(1);
  });

  it('calls setCountInBars with the entered bar count', () => {
    const props = baseProps();
    render(<MetronomeControl {...props} />);

    const countInField = screen.getByLabelText(copy.metronome.countInLabel);
    fireEvent.change(countInField, { target: { value: '2' } });

    expect(props.setCountInBars).toHaveBeenCalledWith(2);
  });
});
