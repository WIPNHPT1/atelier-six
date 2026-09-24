import { copy } from '../../content/copy.en-GB';
import { listChordNames } from '../../core/shapes/library';
import type { Command } from '../../ui/CommandPalette/registerCommands';
import { LESSONS } from './lessonData';

export function courseCommands(): Command[] {
  const lessons: Command[] = LESSONS.map((lesson) => ({
    id: `lesson-${lesson.id}`,
    group: 'Lessons',
    label: lesson.title,
    keywords: [copy.course.modules[lesson.module].title, ...lesson.chords],
    run: ({ navigate }) => {
      void navigate(`/lesson/${lesson.id}`);
    },
  }));
  const chords: Command[] = listChordNames().map((name) => ({
    id: `chord-${name}`,
    group: 'Chords',
    label: name,
    run: ({ navigate }) => {
      void navigate(`/library/${encodeURIComponent(name)}`);
    },
  }));
  return [...lessons, ...chords];
}
