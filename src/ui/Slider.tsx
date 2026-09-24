import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import styles from './Slider.module.css';

export type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  bigStep?: number;
  onChange: (value: number) => void;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function Slider({ label, value, min, max, step = 1, bigStep = 5, onChange }: SliderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const percent = ((value - min) / (max - min)) * 100;

  function change(next: number) {
    if (next !== value) onChange(next);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const delta = event.shiftKey ? bigStep : step;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      change(clamp(value + delta, min, max));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      change(clamp(value - delta, min, max));
    }
  }

  // The native range thumb is hidden and the styled handle sits on top of it,
  // so pointer dragging is handled here for mouse, touch and pen alike.
  function valueAt(event: PointerEvent<HTMLDivElement>): number {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = rect.width > 0 ? clamp((event.clientX - rect.left) / rect.width, 0, 1) : 0;
    const snapped = Math.round((ratio * (max - min)) / step) * step + min;
    return clamp(snapped, min, max);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    inputRef.current?.focus({ preventScroll: true });
    change(valueAt(event));
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    change(valueAt(event));
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.hitArea}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <div className={styles.track} data-testid="slider-track">
          <div className={styles.fill} style={{ width: `${String(percent)}%` }} />
          <div className={styles.thumb} style={{ left: `${String(percent)}%` }} />
        </div>
        <input
          ref={inputRef}
          className={styles.input}
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => {
            change(Number(event.target.value));
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
