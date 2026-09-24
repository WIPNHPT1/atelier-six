import { useState } from 'react';
import { copy } from '../../content/copy.en-GB';
import { recordFun } from '../../core/progress/record';
import { Button } from '../../ui/Button';
import { Mono } from '../../ui/Mono';
import { Panel } from '../../ui/Panel';
import { Text } from '../../ui/Text';
import styles from './FunVote.module.css';
import { useProgress } from './store';

// "Was that fun?" — one tap per visit, stored only on this device.
export function FunVote({ id, className }: { id: string; className?: string | undefined }) {
  const update = useProgress((s) => s.update);
  const [voted, setVoted] = useState(false);

  function vote(fun: boolean) {
    setVoted(true);
    void update((data) => recordFun(data, id, fun));
  }

  return (
    <Panel className={className}>
      <Mono className={styles.label}>{copy.fun.question}</Mono>
      {voted ? (
        <Text dim role="status">
          {copy.fun.thanks}
        </Text>
      ) : (
        <div className={styles.row} role="group" aria-label={copy.fun.question}>
          <Button
            variant="quiet"
            onClick={() => {
              vote(true);
            }}
          >
            {copy.fun.yes}
          </Button>
          <Button
            variant="quiet"
            onClick={() => {
              vote(false);
            }}
          >
            {copy.fun.no}
          </Button>
        </div>
      )}
    </Panel>
  );
}
