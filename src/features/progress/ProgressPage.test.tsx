import { act, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { copy } from '../../content/copy.en-GB';
import {
  addMinuteScore,
  addPractice,
  localDay,
  recordLessonAttempt,
  recordTransition,
} from '../../core/progress/record';
import { VERSION, emptyProgress, type ProgressData } from '../../core/progress/schema';
import { lessonsFor } from '../lesson/lessonData';
import ProgressPage from './ProgressPage';
import { resetProgressForTests, useProgress } from './store';
import { lessonDone, moduleProgress } from './summary';
import { usePracticeTimer } from './usePracticeTimer';

function seeded(): ProgressData {
  let data = emptyProgress();
  const add = (key: string, attempts: number, misses: number) => {
    for (let i = 0; i < attempts; i++)
      data = recordTransition(data, { key, clean: i >= misses, now: i });
  };
  add('G.open.b>C.open.a', 8, 3);
  add('C.open.a>G.open.b', 8, 1);
  add('Em.open.a>Am.open', 8, 0);
  const first = lessonsFor('power')[0];
  if (first)
    data = recordLessonAttempt(data, {
      lessonId: first.id,
      bpm: first.targetBpm,
      clean: true,
      now: 1,
    });
  const open = lessonsFor('open')[0];
  if (open) data = recordLessonAttempt(data, { lessonId: open.id, bpm: 70, clean: true, now: 1 });
  data = addMinuteScore(data, { key: 'C.open.a>Am.open', date: 1, count: 5 });
  data = addPractice(data, { date: localDay(Date.now()), minutes: 12 });
  return data;
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ProgressPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  resetProgressForTests();
});

describe('ProgressPage', () => {
  it('shows an empty state before any practice', () => {
    renderPage();
    expect(screen.getByText(copy.progressScreen.changesEmpty)).toBeInTheDocument();
    expect(screen.getByText(copy.progressScreen.minutesEmpty)).toBeInTheDocument();
    expect(screen.getAllByText(copy.course.statusNotYet)).toHaveLength(5);
  });

  it('draws the heatmap with an empty diagonal and the worst cell outlined', () => {
    resetProgressForTests(seeded());
    renderPage();
    const table = screen.getByRole('group', { name: copy.progressScreen.changes });
    expect(within(table).getByRole('img', { name: 'G to C: 38 % missed' })).toHaveTextContent(
      '38%',
    );
    expect(within(table).getByRole('img', { name: 'C: same chord' })).toBeInTheDocument();
    expect(within(table).getByRole('img', { name: 'Am to G: not practised yet' })).toHaveAttribute(
      'data-level',
      '0',
    );
    expect(screen.getByRole('link', { name: 'Drill G → C' })).toHaveAttribute(
      'href',
      '/drills?kind=loop&from=G.open.b&to=C.open.a',
    );
    expect(screen.getAllByRole('link', { name: copy.progressScreen.drillThis })).toHaveLength(2);
  });

  it('shows module states, minute scores, lesson bests and minutes today', () => {
    resetProgressForTests(seeded());
    renderPage();
    expect(screen.getByText('1/8')).toBeInTheDocument();
    expect(screen.getByText(copy.course.statusStarted)).toBeInTheDocument();
    expect(screen.getByTestId('minute-score')).toHaveTextContent('Best 5');
    expect(screen.getByText('70 bpm')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: /12 of 20 minutes/ })).toBeInTheDocument();
  });
});

describe('progress store', () => {
  it('exports and re-imports progress, rejecting other files', async () => {
    resetProgressForTests(seeded());
    const json = useProgress.getState().exportJson();
    resetProgressForTests();
    expect(await useProgress.getState().importJson('not json')).toBe(false);
    expect(await useProgress.getState().importJson('{"hello":1}')).toBe(false);
    expect(await useProgress.getState().importJson(json)).toBe(true);
    expect(useProgress.getState().data.minutes[0]?.count).toBe(5);
    expect(
      await useProgress
        .getState()
        .importJson(JSON.stringify({ version: 1, lessons: [], transitions: {}, minutes: [] })),
    ).toBe(true);
    expect(useProgress.getState().data.version).toBe(VERSION);
  });

  it('adds practice minutes while active', () => {
    vi.useFakeTimers();
    function Probe({ active }: { active: boolean }) {
      usePracticeTimer(active);
      return null;
    }
    const { rerender } = render(<Probe active />);
    act(() => {
      vi.advanceTimersByTime(90_000);
    });
    const update = vi.spyOn(useProgress.getState(), 'update');
    rerender(<Probe active={false} />);
    expect(update).toHaveBeenCalledTimes(1);
    const change = update.mock.calls[0]?.[0];
    expect(change?.(emptyProgress()).sessions[0]?.minutes).toBe(1.5);
    rerender(<Probe active />);
    rerender(<Probe active={false} />);
    expect(update).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('summarises module progress', () => {
    const data = seeded();
    const first = lessonsFor('power')[0];
    expect(first && lessonDone(first, data)).toBe(true);
    expect(moduleProgress('power', data)).toMatchObject({ done: 1, total: 8, started: true });
    expect(moduleProgress('lead', data)).toEqual({ done: 0, total: 0, started: false });
  });
});
