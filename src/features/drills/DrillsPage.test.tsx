import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePlaybackStore } from '../../audio/playbackStore';
import { copy } from '../../content/copy.en-GB';
import { MINUTE_MS } from '../../core/drills/minute';
import { bestMinute, useDrillResults } from './drillResults';
import DrillsPage from './DrillsPage';

function Where() {
  const location = useLocation();
  return <output data-testid="where">{location.search}</output>;
}

function renderAt(path = '/drills') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/drills"
          element={
            <>
              <DrillsPage />
              <Where />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  usePlaybackStore.setState({ isPlaying: false, lessonId: null, step: 0, chordIndex: 0 });
  useDrillResults.setState({ minutes: [] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('DrillsPage', () => {
  it('loops the two chosen chords, two bars each', async () => {
    const startLesson = vi.fn().mockResolvedValue(undefined);
    usePlaybackStore.setState({ startLesson });
    const user = userEvent.setup();
    renderAt('/drills?from=C.open.a&to=Am.open');
    expect(screen.getByRole('heading', { name: 'C' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Am' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: copy.lesson.play }));
    expect(startLesson).toHaveBeenCalledWith(
      expect.objectContaining({
        lessonId: 'drill',
        loop: true,
        source: expect.objectContaining({ bars: [2, 2], anticipate: 0 }) as unknown,
      }),
    );
  });

  it('early change anticipates the next chord and flashes the target on beat 4', async () => {
    const startLesson = vi.fn().mockResolvedValue(undefined);
    usePlaybackStore.setState({ startLesson });
    const user = userEvent.setup();
    renderAt('/drills?kind=early&from=C.open.a&to=Am.open');
    await user.click(screen.getByRole('button', { name: copy.lesson.play }));
    expect(startLesson).toHaveBeenCalledWith(
      expect.objectContaining({ source: expect.objectContaining({ anticipate: 2 }) as unknown }),
    );
    act(() => {
      usePlaybackStore.setState({ isPlaying: true, lessonId: 'drill', step: 29, chordIndex: 0 });
    });
    expect(screen.getByText(copy.drills.changeNow)).toBeInTheDocument();
    expect(document.querySelector('[data-flash="true"]')).not.toBeNull();
  });

  it('freeze and check enlarges the target while paused', () => {
    usePlaybackStore.setState({ isPlaying: true, lessonId: 'drill', step: 1, chordIndex: 0 });
    renderAt('/drills?kind=freeze&from=C.open.a&to=Am.open');
    expect(screen.getByText(copy.drills.frozen)).toBeInTheDocument();
    expect(document.querySelector('[data-frozen="true"]')).not.toBeNull();
  });

  it('switching drill or chords updates the address', async () => {
    const user = userEvent.setup();
    renderAt('/drills');
    await user.click(screen.getByRole('radio', { name: copy.drills.kinds.freeze }));
    expect(screen.getByTestId('where').textContent).toContain('kind=freeze');
    await user.selectOptions(screen.getByLabelText(copy.drills.to), 'Am');
    expect(screen.getByTestId('where').textContent).toContain('to=Am');
  });

  it('one minute counts Change taps and Space, then saves the result', () => {
    vi.useFakeTimers();
    renderAt('/drills?kind=minute&from=C.open.a&to=Am.open');
    fireEvent.click(screen.getByRole('button', { name: copy.drills.start }));
    fireEvent.click(screen.getByRole('button', { name: copy.drills.change }));
    fireEvent.keyDown(window, { code: 'Space' });
    fireEvent.keyDown(window, { code: 'KeyA' });
    expect(screen.getByText('2 changes')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(MINUTE_MS + 500);
    });
    expect(screen.getByRole('button', { name: copy.drills.again })).toBeInTheDocument();
    expect(useDrillResults.getState().minutes[0]).toMatchObject({
      from: 'C',
      to: 'Am',
      changes: 2,
    });
    expect(screen.getByText('Best: 2')).toBeInTheDocument();
  });
});

describe('bestMinute', () => {
  it('is null until a pair has a result', () => {
    expect(bestMinute([], 'C', 'G')).toBeNull();
    expect(
      bestMinute(
        [
          { from: 'C', to: 'G', changes: 20, at: 1 },
          { from: 'C', to: 'G', changes: 25, at: 2 },
        ],
        'C',
        'G',
      ),
    ).toBe(25);
  });
});
