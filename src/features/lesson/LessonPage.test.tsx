import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePlaybackStore } from '../../audio/playbackStore';
import { copy } from '../../content/copy.en-GB';
import { useProgress } from '../progress/store';
import { courseCommands } from './commands';
import LessonPage from './LessonPage';
import { LESSONS, firstLesson, lessonsFor, recommendedLesson } from './lessonData';
import { FOCUS_DELAY_MS, useFocusMode } from './useFocusMode';

let capturedAdvance: ((from: number, to: number) => void) | null = null;

vi.mock('../practice/useAutoAdvance', () => ({
  isMicSupported: () => true,
  useAutoAdvance: (opts: { onAdvance: (from: number, to: number) => void }) => {
    capturedAdvance = opts.onAdvance;
  },
}));

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

describe('adaptive tempo in a lesson', () => {
  beforeEach(() => {
    usePlaybackStore.setState({ isPlaying: false, lessonId: null, step: 0, chordIndex: 0 });
  });

  function tempoValue(): number {
    const group = screen.getByRole('group', { name: copy.lesson.tempo });
    const match = /\d+/.exec(group.textContent);
    if (!match) throw new Error('no tempo value found');
    return Number(match[0]);
  }

  it('Clean raises the tempo until the target is reached', async () => {
    if (openLesson === undefined) throw new Error('no open lesson');
    const user = userEvent.setup();
    renderAt(`/lesson/${openLesson.id}`);
    await user.click(screen.getByRole('button', { name: /^Clean/ }));
    expect(tempoValue()).toBe(openLesson.startBpm + 4);
    expect(screen.queryByTestId('target-reached')).toBeNull();
    for (let i = 0; i < 10; i++) await user.keyboard('c');
    expect(tempoValue()).toBeGreaterThanOrEqual(openLesson.targetBpm);
    expect(screen.getByTestId('target-reached')).toHaveTextContent(copy.practice.targetReached);
  });

  it('Missed at the slowest tempo switches to the easier part', async () => {
    if (openLesson === undefined) throw new Error('no open lesson');
    const user = userEvent.setup();
    renderAt(`/lesson/${openLesson.id}`);
    const before = document.querySelector('[data-tab-ascii]')?.getAttribute('data-tab-ascii');
    for (let i = 0; i < 4; i++) await user.keyboard('m');
    expect(tempoValue()).toBe(openLesson.startBpm - 10);
    expect(screen.getByText(copy.practice.easier)).toBeInTheDocument();
    expect(document.querySelector('[data-tab-ascii]')?.getAttribute('data-tab-ascii')).not.toBe(
      before,
    );
    await user.click(screen.getByRole('button', { name: /^Missed/ }));
    expect(screen.getByText('0 % clean')).toBeInTheDocument();
  });
});

describe('lesson data', () => {
  it('recommends a first lesson for each level', () => {
    expect(recommendedLesson('new').module).toBe('power');
    expect(recommendedLesson('someChords').module).toBe('open');
    expect(LESSONS).toContain(recommendedLesson('confident'));
  });

  it('the Listen toggle advances the self-paced bar and records the transition', async () => {
    if (openLesson === undefined) throw new Error('no open lesson');
    const user = userEvent.setup();
    const update = vi.fn().mockResolvedValue(undefined);
    useProgress.setState({ update });
    capturedAdvance = null;

    renderAt(`/lesson/${openLesson.id}`);
    const barText = () => screen.getByText(/^Bar \d+ of \d+$/).textContent;
    expect(barText().startsWith('Bar 1 of')).toBe(true);

    const listenToggle = screen.getByRole('switch', { name: copy.lesson.listen });
    await user.click(listenToggle);
    expect(listenToggle).toHaveAttribute('aria-checked', 'true');
    expect(capturedAdvance).not.toBeNull();

    act(() => {
      capturedAdvance?.(0, 1);
    });

    expect(update).toHaveBeenCalled();
    expect(barText().startsWith('Bar 2 of')).toBe(true);
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
