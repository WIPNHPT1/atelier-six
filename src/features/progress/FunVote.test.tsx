import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { copy } from '../../content/copy.en-GB';
import { recordFun } from '../../core/progress/record';
import { emptyProgress } from '../../core/progress/schema';
import { LESSONS } from '../lesson/lessonData';
import { FunVote } from './FunVote';
import ProgressPage from './ProgressPage';
import { resetProgressForTests, useProgress } from './store';

beforeEach(() => {
  resetProgressForTests();
});

describe('Was that fun?', () => {
  it('records one vote per visit, on this device', async () => {
    const user = userEvent.setup();
    render(<FunVote id="lesson-a" />);
    await user.click(screen.getByRole('button', { name: copy.fun.no }));
    expect(screen.getByRole('status')).toHaveTextContent(copy.fun.thanks);
    expect(screen.queryByRole('button', { name: copy.fun.yes })).toBeNull();
    await screen.findByRole('status');
    expect(useProgress.getState().data.fun['lesson-a']).toEqual({ up: 0, down: 1 });
  });

  it('lists lessons with two or more thumbs down under Needs a rethink', () => {
    const lesson = LESSONS[0];
    if (lesson === undefined) throw new Error('no lessons');
    resetProgressForTests(
      recordFun(recordFun(emptyProgress(), lesson.id, false), lesson.id, false),
    );
    render(
      <MemoryRouter>
        <ProgressPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(copy.fun.rethink)).toBeInTheDocument();
    expect(screen.getByTestId('needs-rethink')).toHaveTextContent(lesson.title);
    expect(screen.getByTestId('needs-rethink')).toHaveTextContent('2 thumbs down');
  });
});
