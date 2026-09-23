import type { KeyboardEvent } from 'react'
import styles from './SegmentedControl.module.css'

export type Segment = {
  value: string
  label: string
}

export type SegmentedControlProps = {
  label: string
  segments: Segment[]
  value: string
  onChange: (value: string) => void
}

export function SegmentedControl({ label, segments, value, onChange }: SegmentedControlProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const direction = event.key === 'ArrowRight' ? 1 : -1
    const nextIndex = (index + direction + segments.length) % segments.length
    const next = segments[nextIndex]
    if (!next) return
    onChange(next.value)
    const buttons = event.currentTarget.parentElement?.querySelectorAll('button')
    buttons?.[nextIndex]?.focus()
  }

  return (
    <div role="radiogroup" aria-label={label} className={styles.group}>
      {segments.map((segment, index) => {
        const selected = segment.value === value
        return (
          <button
            key={segment.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className={[styles.segment, selected ? styles.selected : ''].filter(Boolean).join(' ')}
            onClick={() => {
              onChange(segment.value)
            }}
            onKeyDown={(event) => {
              handleKeyDown(event, index)
            }}
          >
            {segment.label}
          </button>
        )
      })}
    </div>
  )
}
