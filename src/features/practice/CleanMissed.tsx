import { useEffect, useRef, useState } from 'react';
import { copy, t } from '../../content/copy.en-GB';
import { BrassSheen } from '../../ui/BrassSheen';
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
  onClean?: () => void;
};

export function CleanMissed({
  tempo,
  targetReached = false,
  easier = false,
  onClean,
}: CleanMissedProps) {
  const [sheenKey, setSheenKey] = useState(0);
  const wasReached = useRef(targetReached);

  useEffect(() => {
    if (targetReached && !wasReached.current) setSheenKey((key) => key + 1);
    wasReached.current = targetReached;
  }, [targetReached]);

  return (
    <div className={styles.row} role="group" aria-label={copy.practice.feedback}>
      <Button
        variant="quiet"
        aria-keyshortcuts={copy.practice.cleanKey}
        onClick={() => {
          tempo.record(true);
          onClean?.();
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
        <BrassSheen triggerKey={sheenKey}>
          <Pill data-testid="target-reached">{copy.practice.targetReached}</Pill>
        </BrassSheen>
      ) : null}
      {easier ? <Pill>{copy.practice.easier}</Pill> : null}
    </div>
  );
}
