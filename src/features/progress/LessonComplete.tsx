import { useState } from 'react';
import { copy } from '../../content/copy.en-GB';
import { setLessonCompleted } from '../../core/progress/record';
import { BrassSheen } from '../../ui/BrassSheen';
import { Mono } from '../../ui/Mono';
import { Panel } from '../../ui/Panel';
import { Text } from '../../ui/Text';
import { Toggle } from '../../ui/Toggle';
import styles from './LessonComplete.module.css';
import { useProgress, useProgressData } from './store';

// Marking a lesson complete is independent of hitting its target tempo (either counts, see
// lessonDone) and reversible, in case of a mis-tap.
export function LessonComplete({
  id,
  keyRoot,
  className,
}: {
  id: string;
  keyRoot?: string;
  className?: string | undefined;
}) {
  const data = useProgressData();
  const update = useProgress((s) => s.update);
  const completed = data.lessons[id]?.completed === true;
  const [sheenKey, setSheenKey] = useState(0);

  function toggle(next: boolean) {
    void update((current) => setLessonCompleted(current, id, next, Date.now()));
    if (next) {
      setSheenKey((key) => key + 1);
      void import('../../audio/uiSounds').then(({ playCompletionChime }) => {
        playCompletionChime(keyRoot);
      });
    }
  }

  return (
    <Panel className={className}>
      <div className={styles.row}>
        <div className={styles.text}>
          <BrassSheen triggerKey={sheenKey}>
            <Mono className={styles.label}>{copy.lesson.markComplete}</Mono>
          </BrassSheen>
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
