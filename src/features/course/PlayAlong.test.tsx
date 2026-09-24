import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePlaybackStore } from '../../audio/playbackStore';
import { useSettingsStore } from '../../app/settingsStore';
import { copy } from '../../content/copy.en-GB';
import { lessonsFor } from '../lesson/lessonData';
import { PlayAlong } from './PlayAlong';

const lesson = lessonsFor('power')[0];
const song = { artist: 'Blink-182', song: 'All the Small Things', note: '' };

beforeEach(() => {
  useSettingsStore.setState({ tuning: 'dropD', capo: 3 });
  usePlaybackStore.setState({ isPlaying: false, lessonId: null });
});

describe('PlayAlong', () => {
  it('sets tuning and capo, takes a tapped tempo and loops the lesson with a click', async () => {
    if (lesson === undefined) throw new Error('no lesson');
    const startLesson = vi.fn().mockResolvedValue(undefined);
    usePlaybackStore.setState({ startLesson });
    let now = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    const user = userEvent.setup();
    render(<PlayAlong song={song} lesson={lesson} />);
    await user.click(screen.getByRole('button', { name: 'Play along with All the Small Things' }));
    expect(useSettingsStore.getState()).toMatchObject({ tuning: 'standard', capo: 0 });
    expect(screen.getByText(copy.course.tapFirst)).toBeInTheDocument();
    for (let tap = 0; tap < 3; tap++) {
      await user.click(screen.getByRole('button', { name: copy.course.tap }));
      now += 400;
    }
    expect(screen.getByText('150 bpm')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: `Loop ${lesson.title} at this tempo` }));
    expect(startLesson).toHaveBeenCalledWith(
      expect.objectContaining({
        bpm: 150,
        loop: true,
        source: expect.objectContaining({ click: true }) as unknown,
      }),
    );
    expect(startLesson.mock.calls[0]?.[0]).not.toHaveProperty('prepared');
    vi.restoreAllMocks();
  });
});
