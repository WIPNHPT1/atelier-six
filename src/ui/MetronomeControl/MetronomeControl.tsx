import { MAX_BPM, MIN_BPM } from '../../audio/metronomeConstants';
import { copy } from '../../content/copy.en-GB';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { MetronomeIcon } from '../icons';
import styles from './MetronomeControl.module.css';

export type MetronomeControlProps = {
  bpm: number;
  setBpm: (bpm: number) => void;
  isOn: boolean;
  toggle: () => void;
  countInBars: number;
  setCountInBars: (bars: number) => void;
  tap: () => void;
};

export function MetronomeControl({
  bpm,
  setBpm,
  isOn,
  toggle,
  countInBars,
  setCountInBars,
  tap,
}: MetronomeControlProps) {
  return (
    <div className={styles.control} data-testid="metronome-control">
      <IconButton
        label={isOn ? copy.metronome.stop : copy.metronome.start}
        active={isOn}
        aria-pressed={isOn}
        onClick={toggle}
      >
        <MetronomeIcon />
      </IconButton>

      <label className={styles.field}>
        <span className={styles.label}>{copy.metronome.bpmLabel}</span>
        <input
          className={styles.input}
          type="number"
          min={MIN_BPM}
          max={MAX_BPM}
          value={bpm}
          onChange={(event) => {
            setBpm(Number(event.target.value));
          }}
        />
      </label>

      <Button variant="quiet" size="small" onClick={tap}>
        {copy.metronome.tap}
      </Button>

      <label className={styles.field}>
        <span className={styles.label}>{copy.metronome.countInLabel}</span>
        <input
          className={styles.input}
          type="number"
          min={0}
          max={4}
          value={countInBars}
          onChange={(event) => {
            setCountInBars(Number(event.target.value));
          }}
        />
      </label>
    </div>
  );
}
