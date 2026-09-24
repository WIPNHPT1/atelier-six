import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSettingsStore } from '../../app/settingsStore';
import { copy } from '../../content/copy.en-GB';
import { recordLessonAttempt, recordTransition } from '../../core/progress/record';
import { emptyProgress } from '../../core/progress/schema';
import { LESSONS } from '../lesson/lessonData';
import { resetProgressForTests } from '../progress/store';
import TodayPage from './TodayPage';

vi.mock('./WarmupClick', () => ({ default: () => <p>click running</p> }));

function renderPage() {
  return render(
    <MemoryRouter>
      <TodayPage />
    </MemoryRouter>,
  );
}

const DAY = 86_400_000;

beforeEach(() => {
  useSettingsStore.setState({ onboardingComplete: true });
  resetProgressForTests();
});

describe('TodayPage', () => {
  it('shows the ring, the warm-up tab, the first lesson and no reviews yet', () => {
    renderPage();
    expect(screen.getByRole('progressbar', { name: /of 20 minutes/ })).toBeInTheDocument();
    expect(screen.getByLabelText(copy.today.warmupTab).textContent).toMatch(/^e\|-/);
    const first = LESSONS[0];
    if (first === undefined) throw new Error('no lessons');
    expect(screen.getByRole('heading', { name: first.title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: copy.today.start })).toHaveAttribute(
      'href',
      `/lesson/${first.id}`,
    );
    expect(screen.getByText(copy.today.reviewsEmpty)).toBeInTheDocument();
  });

  it('lists due reviews with drill links', () => {
    const key = 'G.open.b>C.open.a';
    resetProgressForTests(
      recordTransition(emptyProgress(), { key, clean: false, now: Date.now() - 2 * DAY }),
    );
    renderPage();
    expect(screen.getByText('G → C')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Drill G to C' })).toHaveAttribute(
      'href',
      '/drills?kind=loop&from=G.open.b&to=C.open.a',
    );
  });

  it('points to the course once every lesson is done', () => {
    const done = LESSONS.reduce(
      (data, lesson) =>
        recordLessonAttempt(data, {
          lessonId: lesson.id,
          bpm: lesson.targetBpm,
          clean: true,
          now: 1,
        }),
      emptyProgress(),
    );
    resetProgressForTests(done);
    renderPage();
    expect(screen.getByText(copy.today.allDone)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: copy.today.browse })).toHaveAttribute(
      'href',
      '/course',
    );
  });

  it('offers the module tune once most of the module is done', () => {
    const power = LESSONS.filter((lesson) => lesson.module === 'power');
    const done = power.reduce(
      (data, lesson) =>
        recordLessonAttempt(data, {
          lessonId: lesson.id,
          bpm: lesson.targetBpm,
          clean: true,
          now: 1,
        }),
      emptyProgress(),
    );
    resetProgressForTests(done);
    renderPage();
    expect(screen.getByText('Your module tune is ready: Sodium Streetlights.')).toBeInTheDocument();
  });

  it('starts the warm-up click on demand', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: copy.today.startClick }));
    expect(await screen.findByText('click running')).toBeInTheDocument();
  });

  it('sends a first-time visitor to onboarding', () => {
    useSettingsStore.setState({ onboardingComplete: false });
    renderPage();
    expect(screen.queryByText(copy.today.warmup)).toBeNull();
  });
});
