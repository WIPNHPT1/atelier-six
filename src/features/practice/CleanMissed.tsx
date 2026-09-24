import { copy, t } from '../../content/copy.en-GB';
import { Button } from '../../ui/Button';
import { Mono } from '../../ui/Mono';
import { Pill } from '../../ui/Pill';
import type { AdaptiveTempo } from './useAdaptiveTempo';
import styles from './CleanMissed.module.css';

const PERCENT = 100;

export type CleanMissedProps = {
  tempo: AdaptiveTempo;
  targetReached?: boolean;
  easier?: boolean;
};

export function CleanMissed({ tempo, targetReached = false, easier = false }: CleanMissedProps) {
  return (
    <div className={styles.row} role="group" aria-label={copy.practice.feedback}>
      <Button
        variant="quiet"
        aria-keyshortcuts={copy.practice.cleanKey}
        onClick={() => {
          tempo.record(true);
        }}
      >
        {copy.practice.clean}
        <Mono className={styles.key}>{copy.practice.cleanKey}</Mono>
      </Button>
      <Button
        variant="quiet"
        aria-keyshortcuts={copy.practice.missedKey}
        onClick={() => {
          tempo.record(false);
        }}
      >
        {copy.practice.missed}
        <Mono className={styles.key}>{copy.practice.missedKey}</Mono>
      </Button>
      {tempo.last === null ? null : (
        <Mono className={styles.rate}>
          {t('practice.rate', { percent: Math.round(tempo.last.cleanRate * PERCENT) })}
        </Mono>
      )}
      {targetReached ? (
        <Pill data-testid="target-reached">{copy.practice.targetReached}</Pill>
      ) : null}
      {easier ? <Pill>{copy.practice.easier}</Pill> : null}
    </div>
  );
}
