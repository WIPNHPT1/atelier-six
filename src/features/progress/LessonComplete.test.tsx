import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { copy } from '../../content/copy.en-GB';
import { LessonComplete } from './LessonComplete';
import { resetProgressForTests, useProgress } from './store';

describe('LessonComplete', () => {
  beforeEach(() => {
    resetProgressForTests();
  });

  it('starts unchecked and shows the hint to mark it complete', () => {
    render(<LessonComplete id="lesson-a" />);
    expect(screen.getByRole('switch', { name: copy.lesson.markComplete })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(screen.getByText(copy.lesson.markCompleteHint)).toBeInTheDocument();
  });

  it('marks the lesson complete and updates the progress store', async () => {
    const user = userEvent.setup();
    render(<LessonComplete id="lesson-a" />);

    await user.click(screen.getByRole('switch', { name: copy.lesson.markComplete }));

    expect(screen.getByRole('switch', { name: copy.lesson.completed })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByText(copy.lesson.completedHint)).toBeInTheDocument();
    expect(useProgress.getState().data.lessons['lesson-a']?.completed).toBe(true);
  });

  it('can be unmarked again', async () => {
    const user = userEvent.setup();
    render(<LessonComplete id="lesson-a" />);

    await user.click(screen.getByRole('switch', { name: copy.lesson.markComplete }));
    await user.click(screen.getByRole('switch', { name: copy.lesson.completed }));

    expect(screen.getByRole('switch', { name: copy.lesson.markComplete })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(useProgress.getState().data.lessons['lesson-a']?.completed).toBe(false);
  });
});
