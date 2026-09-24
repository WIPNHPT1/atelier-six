import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePlaybackStore } from '../../audio/playbackStore';
import { copy } from '../../content/copy.en-GB';
import { courseCommands } from './commands';
import LessonPage from './LessonPage';
import { LESSONS, firstLesson, lessonsFor, recommendedLesson } from './lessonData';
import { FOCUS_DELAY_MS, useFocusMode } from './useFocusMode';

const openLesson = lessonsFor('open')[0];

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/lesson/:id" element={<LessonPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function tabAscii(): string | null {
  return document.querySelector('[data-tab-ascii]')?.getAttribute('data-tab-ascii') ?? null;
}

describe('LessonPage', () => {
  beforeEach(() => {
    usePlaybackStore.setState({ isPlaying: false, lessonId: null, step: 0, chordIndex: 0 });
  });

  it('shows the lesson header, tips and listening references', () => {
    if (openLesson === undefined) throw new Error('no open lesson');
    renderAt(`/lesson/${openLesson.id}`);
    expect(screen.getByRole('heading', { level: 1, name: openLesson.title })).toBeInTheDocument();
    expect(screen.getByText(openLesson.goal)).toBeInTheDocument();
    for (const tip of openLesson.tips) expect(screen.getAllByText(tip).length).toBeGreaterThan(0);
    expect(document.querySelector('[data-finish="sunburst"]')).not.toBeNull();
  });

  it('switching to Chorus changes the tab', async () => {
    if (openLesson === undefined) throw new Error('no open lesson');
    const user = userEvent.setup();
    renderAt(`/lesson/${openLesson.id}`);
    const verse = tabAscii();
    await user.click(screen.getByRole('radio', { name: copy.lesson.sectionNames.chorus }));
    expect(tabAscii()).not.toBe(verse);
  });

  it('Play starts this lesson with its layers', async () => {
    if (openLesson === undefined) throw new Error('no open lesson');
    const startLesson = vi.fn().mockResolvedValue(undefined);
    usePlaybackStore.setState({ startLesson });
    const user = userEvent.setup();
    renderAt(`/lesson/${openLesson.id}`);
    await user.click(screen.getByRole('button', { name: copy.lesson.play }));
    expect(startLesson).toHaveBeenCalledWith(
      expect.objectContaining({ lessonId: openLesson.id, bpm: openLesson.startBpm, loop: true }),
    );
  });

  it('shows Stop and the moving playhead while this lesson plays', async () => {
    if (openLesson === undefined) throw new Error('no open lesson');
    const stopPlayback = vi.fn();
    usePlaybackStore.setState({
      isPlaying: true,
      lessonId: openLesson.id,
      step: 5,
      chordIndex: 1,
      stopPlayback,
    });
    const user = userEvent.setup();
    renderAt(`/lesson/${openLesson.id}`);
    expect(document.querySelector('[data-playhead-step="5"]')).not.toBeNull();
    await user.click(screen.getByRole('button', { name: copy.lesson.stop }));
    expect(stopPlayback).toHaveBeenCalled();
  });

  it('redirects the old demo route to the first lesson', () => {
    renderAt('/lesson/demo');
    expect(
      screen.getByRole('heading', { level: 1, name: firstLesson().title }),
    ).toBeInTheDocument();
  });

  it('says so when the lesson does not exist', () => {
    renderAt('/lesson/nope');
    expect(screen.getByText(copy.lesson.notFound)).toBeInTheDocument();
  });
});

describe('lesson data', () => {
  it('recommends a first lesson for each level', () => {
    expect(recommendedLesson('new').module).toBe('power');
    expect(recommendedLesson('someChords').module).toBe('open');
    expect(LESSONS).toContain(recommendedLesson('confident'));
  });

  it('registers every lesson and chord with the command palette', () => {
    const commands = courseCommands();
    expect(commands.filter((command) => command.group === 'Lessons')).toHaveLength(LESSONS.length);
    expect(commands.some((command) => command.id === 'chord-G')).toBe(true);
  });
});

describe('useFocusMode', () => {
  function Probe({ active }: { active: boolean }) {
    useFocusMode(active);
    return null;
  }

  it('hides chrome after a quiet spell and wakes on a key', () => {
    vi.useFakeTimers();
    const { rerender, unmount } = render(<Probe active />);
    act(() => {
      vi.advanceTimersByTime(FOCUS_DELAY_MS);
    });
    expect(document.documentElement.getAttribute('data-focus')).toBe('on');
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown'));
    });
    expect(document.documentElement.hasAttribute('data-focus')).toBe(false);
    rerender(<Probe active={false} />);
    unmount();
    vi.useRealTimers();
  });
});
