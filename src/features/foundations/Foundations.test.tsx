import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePlaybackStore } from '../../audio/playbackStore';
import { copy } from '../../content/copy.en-GB';
import { WARMUP_SECONDS } from '../../core/practice/handHealth';
import { addPractice, localDay } from '../../core/progress/record';
import { emptyProgress } from '../../core/progress/schema';
import { resetProgressForTests, useProgress } from '../progress/store';
import { FOUNDATIONS, noteShape } from './data';
import FoundationsPage from './FoundationsPage';
import { HandWarmupOffer } from './HandWarmupOffer';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/foundations" element={<FoundationsPage />} />
        <Route path="/foundations/:id" element={<FoundationsPage />} />
        <Route path="/lesson/:id" element={<HandWarmupOffer lessonId="power-stamina" />} />
        <Route path="/" element={<HandWarmupOffer />} />
      </Routes>
    </MemoryRouter>,
  );
}

const startLesson = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  startLesson.mockClear();
  usePlaybackStore.setState({ startLesson });
  resetProgressForTests();
});

describe('Foundations', () => {
  it('lists five lessons', () => {
    renderAt('/foundations');
    expect(screen.getAllByRole('link', { name: /^Start / })).toHaveLength(FOUNDATIONS.length);
  });

  for (const { id } of FOUNDATIONS) {
    it(`${id} opens with its title and a way on`, () => {
      renderAt(`/foundations/${id}`);
      expect(
        screen.getByRole('heading', { level: 1, name: copy.foundations.lessons[id].title }),
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: copy.foundations.back })).toBeInTheDocument();
    });
  }

  it('reading tab: symbols one at a time, tapping a note lights and plays it, then a check', async () => {
    const user = userEvent.setup();
    renderAt('/foundations/read-tab');
    expect(screen.getByText(copy.foundations.tab.lines)).toBeInTheDocument();
    for (let i = 0; i < 5; i++)
      await user.click(screen.getByRole('button', { name: copy.foundations.tab.nextSymbol }));
    expect(screen.getByText(copy.foundations.tab.picking)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Note 1: A string, fret 3' }));
    expect(screen.getByTestId('lit-note')).toHaveTextContent('A string, fret 3');
    expect(startLesson).toHaveBeenCalledWith(
      expect.objectContaining({ lessonId: 'foundations-note' }),
    );
    await user.click(screen.getByRole('button', { name: copy.foundations.tab.checkStart }));
    // Notes 2 and 5 are open strings (fret 0); note 8 is fret 1.
    await user.click(screen.getByRole('button', { name: 'Fret 0' }));
    await user.click(screen.getByRole('button', { name: 'Fret 0' }));
    await user.click(screen.getByRole('button', { name: 'Fret 1' }));
    expect(screen.getByRole('status')).toHaveTextContent('3 of 3 right.');
  });

  it('reading tab check runs out after thirty seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderAt('/foundations/read-tab');
    await user.click(screen.getByRole('button', { name: copy.foundations.tab.checkStart }));
    for (let s = 0; s < 30; s++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }
    expect(screen.getByRole('status')).toHaveTextContent('Time is up. 0 of 3 right.');
    vi.useRealTimers();
  });

  it('fretting names the strings that buzzed', async () => {
    const user = userEvent.setup();
    renderAt('/foundations/fretting');
    for (const answer of [true, false, true, true, false, true]) {
      await user.click(
        screen.getByRole('button', {
          name: answer ? copy.foundations.fret.clean : copy.foundations.fret.buzzed,
        }),
      );
    }
    expect(screen.getByRole('status')).toHaveTextContent('Muffled: A, B.');
    await user.click(screen.getByRole('button', { name: copy.foundations.fret.again }));
    for (let i = 0; i < 6; i++)
      await user.click(screen.getByRole('button', { name: copy.foundations.fret.clean }));
    expect(screen.getByRole('status')).toHaveTextContent(copy.foundations.fret.allClean);
  });

  it('tune-up plays each open string', async () => {
    const user = userEvent.setup();
    renderAt('/foundations/tune-up');
    await user.click(screen.getByRole('button', { name: 'Play E2' }));
    expect(startLesson).toHaveBeenCalled();
    expect(screen.getByText('A string · A · 110.0 Hz')).toBeInTheDocument();
  });

  it('hand-health warm-up runs two minutes and remembers the day', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderAt('/foundations/hand-health');
    expect(screen.getByText(copy.foundations.health.stop)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: copy.foundations.health.start }));
    expect(screen.getByText(copy.foundations.health.movements.shake)).toBeInTheDocument();
    for (let s = 0; s < WARMUP_SECONDS; s++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }
    expect(screen.getByRole('status')).toHaveTextContent(copy.foundations.health.finished);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(useProgress.getState().data.handWarmup).toBe(localDay(Date.now()));
    vi.useRealTimers();
  });

  it('makes one-note shapes for the fretboard', () => {
    expect(noteShape(6, 0).notes[0]).toEqual({ fret: 0, finger: 0 });
    expect(noteShape(1, 7).notes[5]).toEqual({ fret: 7, finger: 4 });
  });
});

describe('hand warm-up offer', () => {
  it('appears before downpicking stamina and goes away when skipped', async () => {
    const user = userEvent.setup();
    renderAt('/lesson/power-stamina');
    expect(screen.getByText(copy.foundations.offer)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: copy.foundations.offerSkip }));
    expect(screen.queryByTestId('hand-warmup-offer')).toBeNull();
  });

  it('appears on Today after half an hour of practice', () => {
    resetProgressForTests(
      addPractice(emptyProgress(), { date: localDay(Date.now()), minutes: 35 }),
    );
    renderAt('/');
    expect(screen.getByText(copy.foundations.offerLong)).toBeInTheDocument();
  });

  it('stays quiet otherwise', () => {
    renderAt('/');
    expect(screen.queryByTestId('hand-warmup-offer')).toBeNull();
  });
});
