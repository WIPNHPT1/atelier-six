import { useEffect, useRef } from 'react';
import { IconButton } from './IconButton';
import { MinusIcon, PlusIcon } from './icons';
import { Mono } from './Mono';
import styles from './Stepper.module.css';

export type StepperProps = {
  label: string;
  decrementLabel: string;
  incrementLabel: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
};

const HOLD_DELAY_MS = 400;
const HOLD_INTERVAL_MS = 100;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// A press-and-hold +/- control: obviously a numeric setting (unlike a bare slider), and
// precise to the unit for values like tempo where "roughly here" isn't good enough.
export function Stepper({
  label,
  decrementLabel,
  incrementLabel,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = String,
}: StepperProps) {
  const valueRef = useRef(value);
  const timeoutRef = useRef<number | undefined>(undefined);
  const intervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  function nudge(direction: 1 | -1) {
    const next = clamp(valueRef.current + direction * step, min, max);
    valueRef.current = next;
    onChange(next);
  }

  function stopHold() {
    window.clearTimeout(timeoutRef.current);
    window.clearInterval(intervalRef.current);
  }

  useEffect(() => stopHold, []);
  useEffect(() => {
    window.addEventListener('pointerup', stopHold);
    return () => {
      window.removeEventListener('pointerup', stopHold);
    };
  }, []);

  function startHold(direction: 1 | -1) {
    nudge(direction);
    timeoutRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(() => {
        nudge(direction);
      }, HOLD_INTERVAL_MS);
    }, HOLD_DELAY_MS);
  }

  return (
    <div className={styles.stepper} role="group" aria-label={label}>
      <IconButton
        label={decrementLabel}
        disabled={value <= min}
        onPointerDown={() => {
          startHold(-1);
        }}
      >
        <MinusIcon />
      </IconButton>
      <Mono className={styles.value} aria-live="polite">
        {format(value)}
      </Mono>
      <IconButton
        label={incrementLabel}
        disabled={value >= max}
        onPointerDown={() => {
          startHold(1);
        }}
      >
        <PlusIcon />
      </IconButton>
    </div>
  );
}
