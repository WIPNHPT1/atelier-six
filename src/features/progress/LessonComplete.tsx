import { copy } from '../../content/copy.en-GB';
import { setLessonCompleted } from '../../core/progress/record';
import { Mono } from '../../ui/Mono';
import { Panel } from '../../ui/Panel';
import { Text } from '../../ui/Text';
import { Toggle } from '../../ui/Toggle';
import styles from './LessonComplete.module.css';
import { useProgress, useProgressData } from './store';

// Marking a lesson complete is independent of hitting its target tempo (either counts, see
// lessonDone) and reversible, in case of a mis-tap.
export function LessonComplete({ id, className }: { id: string; className?: string | undefined }) {
  const data = useProgressData();
  const update = useProgress((s) => s.update);
  const completed = data.lessons[id]?.completed === true;

  function toggle(next: boolean) {
    void update((current) => setLessonCompleted(current, id, next, Date.now()));
  }

  return (
    <Panel className={className}>
      <div className={styles.row}>
        <div className={styles.text}>
          <Mono className={styles.label}>{copy.lesson.markComplete}</Mono>
          <Text dim size="small">
            {completed ? copy.lesson.completedHint : copy.lesson.markCompleteHint}
          </Text>
        </div>
        <Toggle
          label={completed ? copy.lesson.completed : copy.lesson.markComplete}
          checked={completed}
          onChange={toggle}
        />
      </div>
    </Panel>
  );
}
