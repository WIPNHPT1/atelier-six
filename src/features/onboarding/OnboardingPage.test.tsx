import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePlaybackStore } from '../../audio/playbackStore';
import { useSettingsStore } from '../../app/settingsStore';
import { copy } from '../../content/copy.en-GB';
import { grooveFor } from './groove';
import OnboardingPage from './OnboardingPage';

beforeEach(() => {
  useSettingsStore.setState({ level: 'new', onboardingComplete: false });
  usePlaybackStore.setState({ isPlaying: false, lessonId: null });
});

describe('first groove', () => {
  it('is E5–A5 for power chords and Em–C for open chords, with the band', () => {
    const power = grooveFor('new');
    expect(power.module).toBe('power');
    expect(power.shapes.map((shape) => shape.chord)).toEqual(['E5', 'A5']);
    expect(power.prepared.band?.some((event) => event.part === 'drums')).toBe(true);
    const open = grooveFor('someChords');
    expect(open.shapes.map((shape) => shape.chord)).toEqual(['Em', 'C']);
    expect(open.prepared.band?.some((event) => event.part === 'pad')).toBe(true);
  });

  it('ends onboarding with the groove before any lesson', async () => {
    const startLesson = vi.fn().mockResolvedValue(undefined);
    const stopPlayback = vi.fn();
    usePlaybackStore.setState({ startLesson, stopPlayback });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/lesson/:id" element={<p>lesson page</p>} />
        </Routes>
      </MemoryRouter>,
    );
    for (let step = 0; step < 4; step++)
      await user.click(screen.getByRole('button', { name: copy.onboarding.next }));
    await user.click(screen.getByRole('button', { name: copy.onboarding.playGroove }));
    expect(startLesson).toHaveBeenCalledWith(
      expect.objectContaining({ lessonId: 'onboarding-groove', loop: true }),
    );
    usePlaybackStore.setState({ isPlaying: true, lessonId: 'onboarding-groove' });
    await user.click(await screen.findByRole('button', { name: copy.onboarding.stopGroove }));
    expect(stopPlayback).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: copy.onboarding.done }));
    expect(stopPlayback).toHaveBeenCalledTimes(2);
    expect(screen.getByText('lesson page')).toBeInTheDocument();
  });
});
