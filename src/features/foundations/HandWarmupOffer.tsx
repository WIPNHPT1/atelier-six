import { useState } from 'react';
import { Link } from 'react-router-dom';
import { copy } from '../../content/copy.en-GB';
import { LONG_SESSION_MINUTES, offerHandWarmup } from '../../core/practice/handHealth';
import { localDay, minutesOn, recordHandWarmup } from '../../core/progress/record';
import { Button } from '../../ui/Button';
import { Panel } from '../../ui/Panel';
import { Text } from '../../ui/Text';
import { useProgress, useProgressData } from '../progress/store';
import styles from './Foundations.module.css';

// Offered before demanding lessons and long sessions; doing or skipping it counts for the day.
export function HandWarmupOffer({ lessonId }: { lessonId?: string }) {
  const data = useProgressData();
  const update = useProgress((s) => s.update);
  const [today] = useState(() => localDay(Date.now()));
  const minutesToday = minutesOn(data, today);
  const show = offerHandWarmup({
    ...(lessonId === undefined ? {} : { lessonId }),
    minutesToday,
    lastWarmup: data.handWarmup,
    today,
  });
  if (!show) return null;
  const forLesson = lessonId !== undefined && minutesToday <= LONG_SESSION_MINUTES;

  return (
    <Panel className={styles.stack} data-testid="hand-warmup-offer">
      <Text>{forLesson ? copy.foundations.offer : copy.foundations.offerLong}</Text>
      <div className={styles.row}>
        <Link className={styles.primaryLink} to="/foundations/hand-health">
          {copy.foundations.offerGo}
        </Link>
        <Button
          variant="quiet"
          onClick={() => {
            void update((current) => recordHandWarmup(current, today));
          }}
        >
          {copy.foundations.offerSkip}
        </Button>
      </div>
    </Panel>
  );
}
