import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TunerPage from './TunerPage';
import { copy } from '../../content/copy.en-GB';
import { useSettingsStore } from '../../app/settingsStore';
import { MicPermissionDeniedError, MicUnsupportedError } from '../../audio/mic';

let capturedFrame: ((buffer: Float32Array, sampleRate: number) => void) | null = null;
const startMic = vi.fn();
const stopMic = vi.fn();
const ensureAudio = vi.fn().mockResolvedValue(undefined);
const playReferenceTone = vi.fn();
const detectPitch = vi.fn();

vi.mock('../../audio/mic', () => ({
  startMic: (onFrame: (buffer: Float32Array, sampleRate: number) => void): Promise<void> =>
    startMic(onFrame) as Promise<void>,
  stopMic: () => {
    stopMic();
  },
  MicPermissionDeniedError: class MicPermissionDeniedError extends Error {},
  MicUnsupportedError: class MicUnsupportedError extends Error {},
}));

vi.mock('../../audio/engine', () => ({
  ensureAudio: (): Promise<void> => ensureAudio() as Promise<void>,
  playReferenceTone: (midi: number) => {
    playReferenceTone(midi);
  },
}));

vi.mock('../../core/pitch/detectPitch', () => ({
  detectPitch: (
    buffer: Float32Array,
    sampleRate: number,
  ): { freq: number; clarity: number } | null =>
    detectPitch(buffer, sampleRate) as { freq: number; clarity: number } | null,
}));

function resetSettings() {
  useSettingsStore.setState({
    mode: 'dark',
    finish: 'nitro',
    motion: 'system',
    sound: true,
    leftHanded: false,
    tuning: 'standard',
    capo: 0,
    a4: 440,
    level: 'new',
    onboardingComplete: false,
    robotMode: false,
  });
}

describe('TunerPage', () => {
  beforeEach(() => {
    resetSettings();
    capturedFrame = null;
    startMic.mockImplementation((onFrame: (buffer: Float32Array, sampleRate: number) => void) => {
      capturedFrame = onFrame;
      return Promise.resolve();
    });
    detectPitch.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
    resetSettings();
  });

  it('starts idle with the Start button visible', () => {
    render(<TunerPage />);
    expect(screen.getByRole('button', { name: copy.tunerScreen.start })).toBeInTheDocument();
    expect(screen.getByTestId('tuner-status')).toHaveTextContent(copy.tunerScreen.statusIdle);
  });

  it('starts listening and shows a detected note', async () => {
    const user = userEvent.setup();
    detectPitch.mockReturnValue({ freq: 82.41, clarity: 0.95 });
    render(<TunerPage />);

    await user.click(screen.getByRole('button', { name: copy.tunerScreen.start }));

    expect(screen.getByTestId('tuner-status')).toHaveTextContent(copy.tunerScreen.statusListening);
    expect(startMic).toHaveBeenCalledTimes(1);

    act(() => {
      capturedFrame?.(new Float32Array(4096), 44100);
    });

    expect(screen.getByTestId('tuner-note')).toHaveTextContent('E2');
  });

  it('stops the mic and clears the note on Stop', async () => {
    const user = userEvent.setup();
    detectPitch.mockReturnValue({ freq: 82.41, clarity: 0.95 });
    render(<TunerPage />);

    await user.click(screen.getByRole('button', { name: copy.tunerScreen.start }));
    act(() => {
      capturedFrame?.(new Float32Array(4096), 44100);
    });
    expect(screen.getByTestId('tuner-note')).toHaveTextContent('E2');

    await user.click(screen.getByRole('button', { name: copy.tunerScreen.stop }));

    expect(stopMic).toHaveBeenCalled();
    expect(screen.getByTestId('tuner-status')).toHaveTextContent(copy.tunerScreen.statusStopped);
    expect(screen.getByTestId('tuner-note')).toHaveTextContent('—');
  });

  it('shows a calm message when the microphone permission is denied', async () => {
    const user = userEvent.setup();
    startMic.mockImplementation(() => Promise.reject(new MicPermissionDeniedError()));
    render(<TunerPage />);

    await user.click(screen.getByRole('button', { name: copy.tunerScreen.start }));

    expect(screen.getByTestId('tuner-status')).toHaveTextContent(copy.tunerScreen.statusDenied);
    expect(screen.queryByTestId('tuner-note')).not.toBeInTheDocument();
  });

  it('shows a calm message when the microphone is unsupported', async () => {
    const user = userEvent.setup();
    startMic.mockImplementation(() => Promise.reject(new MicUnsupportedError()));
    render(<TunerPage />);

    await user.click(screen.getByRole('button', { name: copy.tunerScreen.start }));

    expect(screen.getByTestId('tuner-status')).toHaveTextContent(
      copy.tunerScreen.statusUnsupported,
    );
  });

  it('plays a reference tone when a string button is tapped', async () => {
    const user = userEvent.setup();
    render(<TunerPage />);

    await user.click(
      screen.getByRole('button', {
        name: copy.tunerScreen.referenceToneLabel.replace('{note}', 'E2'),
      }),
    );

    expect(ensureAudio).toHaveBeenCalled();
    expect(playReferenceTone).toHaveBeenCalledWith(40);
  });
});
