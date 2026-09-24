import { Link } from 'react-router-dom';
import { copy, t } from '../../content/copy.en-GB';
import { midiToFreq, noteName } from '../../core/theory/pitch';
import { Button } from '../../ui/Button';
import { Panel } from '../../ui/Panel';
import { Text } from '../../ui/Text';
import { STRING_NAMES, midiOf, playNote } from './data';
import styles from './Foundations.module.css';

const LOW_TO_HIGH = [6, 5, 4, 3, 2, 1];

export function TuneUp() {
  const tune = copy.foundations.tune;
  return (
    <div className={styles.stack}>
      <Panel className={styles.stack}>
        <Text>{tune.intro}</Text>
        <Text dim>{tune.sharp}</Text>
        <Text dim>{tune.flat}</Text>
      </Panel>
      <ul className={styles.list}>
        {LOW_TO_HIGH.map((string) => {
          const midi = midiOf(string, 0);
          const note = noteName(midi % 12);
          return (
            <li key={string} className={styles.listRow}>
              <Text>
                {t('foundations.tune.string', {
                  name: STRING_NAMES[string - 1] ?? '',
                  note,
                  hz: midiToFreq(midi).toFixed(1),
                })}
              </Text>
              <Button
                variant="quiet"
                onClick={() => {
                  playNote(string, 0);
                }}
              >
                {t('foundations.tune.play', {
                  note: `${note}${String(Math.floor(midi / 12) - 1)}`,
                })}
              </Button>
            </li>
          );
        })}
      </ul>
      <Link className={styles.link} to="/tuner">
        {tune.tuner}
      </Link>
    </div>
  );
}
