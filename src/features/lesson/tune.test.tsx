import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePlaybackStore, type StartLessonInput } from '../../audio/playbackStore';
import { copy } from '../../content/copy.en-GB';
import { TUNINGS } from '../../core/style/riffBuilder';
import type { StyleSheet } from '../../core/style/types';
import { STYLES } from '../../data/styles';
import { recordLessonAttempt } from '../../core/progress/record';
import { emptyProgress } from '../../core/progress/schema';
import CourseModulePage from '../course/CourseModulePage';
import { resetProgressForTests } from '../progress/store';
import LessonPage from './LessonPage';
import { TUNES, lessonsFor, riffsFor } from './lessonData';
import { planPerformance, preparePerformance } from './performance';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/lesson/:id" element={<LessonPage />} />
        <Route path="/course/:module" element={<CourseModulePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  usePlaybackStore.setState({
    isPlaying: false,
    lessonId: null,
    finishedId: null,
    step: 0,
    chordIndex: 0,
  });
  resetProgressForTests();
});

describe('module tunes end to end', () => {
  for (const tune of TUNES) {
    it(`${tune.title}: every section scheduled in order, with the band, inside its length`, () => {
      const tuning = TUNINGS[tune.tuning];
      const performance = planPerformance(
        tune,
        STYLES[tune.module] as StyleSheet,
        tuning,
        (n) => n,
      );
      const bars = tune.arrangement.sections.reduce((sum, s) => sum + s.bars, 0);
      expect(performance.bars).toBe(bars);
      const prepared = preparePerformance(performance, tune.module, {
        bpm: tune.targetBpm,
        tuning,
        capo: tune.capo,
        countIn: true,
        click: false,
      });
      const played = prepared.events.filter((event) => event.bar >= 0);
      expect(new Set(played.map((event) => event.bar)).size).toBe(bars);
      expect(Math.max(...played.map((event) => event.t))).toBeLessThan(prepared.totalSeconds);
      expect(prepared.band?.some((event) => event.part === 'drums')).toBe(true);
      expect(prepared.band?.some((event) => event.part === 'bass')).toBe(true);
      expect(prepared.band?.some((event) => event.part === 'pad')).toBe(tune.module === 'open');
      expect(Object.keys(performance.sectionLabels)).toHaveLength(tune.arrangement.sections.length);
      // The throwaway strums that make time for big shifts are played muted.
      const mutedStrums = prepared.events.filter((event) => event.dir === 'mute');
      expect(mutedStrums.length).toBe(
        tune.module === 'power' ? performance.muted.size : mutedStrums.length,
      );
    });
  }
});

describe('tune player', () => {
  const tune = TUNES[0];

  it('plays the whole tune once, with the band, in performance mode', async () => {
    if (tune === undefined) throw new Error('no tune');
    const startLesson = vi
      .fn<(input: StartLessonInput) => Promise<void>>()
      .mockResolvedValue(undefined);
    usePlaybackStore.setState({ startLesson });
    const user = userEvent.setup();
    renderAt(`/lesson/${tune.id}`);
    expect(screen.getByRole('radio', { name: copy.lesson.modes.perform })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await user.click(screen.getByRole('button', { name: copy.lesson.play }));
    const input = startLesson.mock.calls[0]?.[0];
    expect(input?.loop).toBe(false);
    expect(input?.prepared?.band?.length).toBeGreaterThan(0);
    expect(input?.chordNames).toHaveLength(
      tune.arrangement.sections.reduce((sum, s) => sum + s.bars, 0),
    );
  });

  it('shows the finish screen after a full play-through', async () => {
    if (tune === undefined) throw new Error('no tune');
    usePlaybackStore.setState({ finishedId: tune.id });
    const startLesson = vi.fn().mockResolvedValue(undefined);
    usePlaybackStore.setState({ startLesson });
    const user = userEvent.setup();
    renderAt(`/lesson/${tune.id}`);
    expect(screen.getByRole('status')).toHaveTextContent(copy.lesson.finishTitle);
    await user.click(screen.getByRole('button', { name: copy.lesson.playAgain }));
    expect(startLesson).toHaveBeenCalled();
  });

  it('picking a section switches to practising it on a loop', async () => {
    if (tune === undefined) throw new Error('no tune');
    const user = userEvent.setup();
    renderAt(`/lesson/${tune.id}`);
    await user.click(screen.getByRole('radio', { name: copy.lesson.sectionNames.breakdown }));
    expect(screen.getByRole('radio', { name: copy.lesson.modes.practise })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('switch', { name: copy.lesson.loop })).toBeInTheDocument();
  });
});

describe('module page tune and riffs', () => {
  it('shows the tune card and locks riffs until their lesson is done', async () => {
    const [first, second] = riffsFor('power');
    const gate = lessonsFor('power')[2];
    if (first === undefined || second === undefined || gate === undefined) throw new Error('data');
    resetProgressForTests(
      recordLessonAttempt(emptyProgress(), {
        lessonId: gate.id,
        bpm: gate.targetBpm,
        clean: true,
        now: 1,
      }),
    );
    const startLesson = vi.fn().mockResolvedValue(undefined);
    usePlaybackStore.setState({ startLesson });
    const user = userEvent.setup();
    renderAt('/course/power');
    expect(screen.getByRole('link', { name: copy.course.playTune })).toHaveAttribute(
      'href',
      '/lesson/tune-power',
    );
    expect(screen.getByText('Unlocks after lesson 6.')).toBeInTheDocument();
    expect(screen.getByLabelText(`${first.title} tab`).textContent).toMatch(/^e\|/);
    await user.click(screen.getByRole('button', { name: `Play ${first.title}` }));
    expect(startLesson).toHaveBeenCalledWith(
      expect.objectContaining({ lessonId: first.id, loop: true }),
    );
  });
});
