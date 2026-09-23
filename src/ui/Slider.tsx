import type { KeyboardEvent } from 'react'
import styles from './Slider.module.css'

export type SliderProps = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  bigStep?: number
  onChange: (value: number) => void
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function Slider({ label, value, min, max, step = 1, bigStep = 5, onChange }: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const delta = event.shiftKey ? bigStep : step
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault()
      onChange(clamp(value + delta, min, max))
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault()
      onChange(clamp(value - delta, min, max))
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${String(percent)}%` }} />
        <div className={styles.thumb} style={{ left: `${String(percent)}%` }} />
        <input
          className={styles.input}
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => {
            onChange(Number(event.target.value))
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  )
}
