import { useEffect, useState } from 'react';
import { copy, t } from '../../content/copy.en-GB';
import { WARMUP_SECONDS, movementAt } from '../../core/practice/handHealth';
import { localDay, recordHandWarmup } from '../../core/progress/record';
import { Button } from '../../ui/Button';
import { Dial } from '../../ui/Dial';
import { Panel } from '../../ui/Panel';
import { Text } from '../../ui/Text';
import { useProgress } from '../progress/store';
import styles from './Foundations.module.css';

export function HandHealth() {
  const h = copy.foundations.health;
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const update = useProgress((s) => s.update);
  const movement = movementAt(elapsed);
  const finished = movement === null;

  useEffect(() => {
    if (!running || finished) return;
    const timer = window.setTimeout(() => {
      setElapsed((seconds) => seconds + 1);
    }, 1000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [running, finished, elapsed]);

  useEffect(() => {
    if (!finished) return;
    void update((data) => recordHandWarmup(data, localDay(Date.now())));
  }, [finished, update]);

  return (
    <div className={styles.stack}>
      <Panel className={styles.stack}>
        <Text>{h.intro}</Text>
        <Text className={styles.warning}>{h.stop}</Text>
      </Panel>
      <Panel className={styles.centre}>
        <Dial
          label={h.timer}
          value={1 - elapsed / WARMUP_SECONDS}
          displayValue={t('foundations.health.left', { seconds: WARMUP_SECONDS - elapsed })}
          size={140}
        />
        {finished ? (
          <Text role="status">{h.finished}</Text>
        ) : (
          <>
            <Text aria-live="polite">{h.movements[movement]}</Text>
            <Button
              variant="primary"
              onClick={() => {
                setRunning((current) => !current);
              }}
            >
              {running ? h.pause : elapsed === 0 ? h.start : h.resume}
            </Button>
          </>
        )}
      </Panel>
    </div>
  );
}
