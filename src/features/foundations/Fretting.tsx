import { useState } from 'react';
import { copy, t } from '../../content/copy.en-GB';
import { Button } from '../../ui/Button';
import { Panel } from '../../ui/Panel';
import { Text } from '../../ui/Text';
import { STRING_NAMES, playNote } from './data';
import styles from './Foundations.module.css';

const FRET = 3;
const LOW_TO_HIGH = [6, 5, 4, 3, 2, 1];

// Tap-to-confirm version: the player says how each string sounded (listening mode comes later).
export function Fretting() {
  const f = copy.foundations.fret;
  const [results, setResults] = useState<boolean[]>([]);
  const string = LOW_TO_HIGH[results.length];
  const muffled = results.flatMap((clean, i) =>
    clean ? [] : [STRING_NAMES[(LOW_TO_HIGH[i] as number) - 1] ?? ''],
  );

  return (
    <div className={styles.stack}>
      <Panel className={styles.stack}>
        <Text>{f.tips1}</Text>
        <Text>{f.tips2}</Text>
        <Text dim>{f.tips3}</Text>
      </Panel>
      <Panel className={styles.stack}>
        <Text>{f.check}</Text>
        {string !== undefined ? (
          <>
            <Text>{t('foundations.fret.prompt', { string: STRING_NAMES[string - 1] ?? '' })}</Text>
            <div className={styles.row}>
              <Button
                variant="quiet"
                onClick={() => {
                  playNote(string, FRET);
                }}
              >
                {t('foundations.tune.play', {
                  note: `${STRING_NAMES[string - 1] ?? ''} ${String(FRET)}`,
                })}
              </Button>
              <Button
                variant="quiet"
                onClick={() => {
                  setResults((current) => [...current, true]);
                }}
              >
                {f.clean}
              </Button>
              <Button
                variant="quiet"
                onClick={() => {
                  setResults((current) => [...current, false]);
                }}
              >
                {f.buzzed}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Text role="status">
              {muffled.length === 0
                ? f.allClean
                : t('foundations.fret.muffled', { strings: muffled.join(', ') })}
            </Text>
            <Button
              variant="quiet"
              onClick={() => {
                setResults([]);
              }}
            >
              {f.again}
            </Button>
          </>
        )}
      </Panel>
    </div>
  );
}
