import { Fragment, useEffect, useRef } from 'react';
import { copy } from '../../content/copy.en-GB';
import { noteName } from '../../core/theory/pitch';
import type { TabColumn } from '../../core/tab/renderTab';
import type { Shape } from '../../core/shapes/types';
import type { Tuning } from '../../core/tuning';
import { useMotionEnabled } from '../../app/settingsStore';
import { cx } from '../cx';
import styles from './TabLane.module.css';

const STRING_COUNT = 6;

export type TabLaneProps = {
  columns: TabColumn[];
  shapes: Shape[];
  tuning: Tuning;
  stepsPerBar: number;
  playhead?: number;
};

function stringLabel(tuning: Tuning, index: number): string {
  const name = noteName(tuning[index] ?? 0);
  return index === STRING_COUNT - 1 ? name.toLowerCase() : name;
}

function chordLabelAt(columns: TabColumn[], shapes: Shape[], columnIndex: number): string | null {
  const column = columns[columnIndex];
  if (!column) return null;
  const previous = columns[columnIndex - 1];
  if (previous !== undefined && previous.chordIndex === column.chordIndex) return null;
  return shapes[column.chordIndex]?.chord ?? null;
}

function strumSymbol(dir: TabColumn['dir']): string | null {
  if (dir === 'D') return copy.tabLane.down;
  if (dir === 'U') return copy.tabLane.up;
  return null;
}

function isPalmMuteStart(columns: TabColumn[], index: number): boolean {
  const column = columns[index];
  if (column?.palmMute !== true) return false;
  const previous = columns[index - 1];
  return previous?.palmMute !== true;
}

export function TabLane({ columns, shapes, tuning, stepsPerBar, playhead }: TabLaneProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const motionEnabled = useMotionEnabled();

  useEffect(() => {
    const el = activeRef.current;
    if (!el || typeof el.scrollIntoView !== 'function') return;
    el.scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: motionEnabled ? 'smooth' : 'auto',
    });
  }, [playhead, motionEnabled]);

  return (
    <div
      ref={rootRef}
      className={styles.lane}
      data-playhead-step={playhead ?? undefined}
      style={{ gridTemplateColumns: `auto repeat(${String(columns.length)}, minmax(1.4em, 1fr))` }}
    >
      <div className={styles.corner} />
      {columns.map((_, index) => (
        <div key={`chord-${String(index)}`} className={styles.chordName}>
          {chordLabelAt(columns, shapes, index)}
        </div>
      ))}

      {Array.from({ length: STRING_COUNT }, (_, row) => STRING_COUNT - 1 - row).map(
        (stringIndex, row) => (
          <Fragment key={`row-${String(row)}`}>
            <div className={styles.stringLabel}>{stringLabel(tuning, stringIndex)}</div>
            {columns.map((column, index) => {
              const isActive = column.step === playhead;
              return (
                <div
                  key={`cell-${String(row)}-${String(index)}`}
                  ref={isActive && row === 0 ? activeRef : undefined}
                  className={cx(
                    styles.cell,
                    index % stepsPerBar === 0 && styles.barStart,
                    isActive && styles.isActive,
                  )}
                  data-testid="tab-column"
                  data-step={column.step}
                >
                  {column.cells[stringIndex] ?? ''}
                </div>
              );
            })}
          </Fragment>
        ),
      )}

      <div className={styles.corner} />
      {columns.map((column, index) => (
        <div key={`arrow-${String(index)}`} className={styles.strum}>
          {strumSymbol(column.dir)}
        </div>
      ))}

      <div className={styles.corner} />
      {columns.map((column, index) => (
        <div
          key={`pm-${String(index)}`}
          className={cx(styles.palmMute, column.palmMute && styles.palmMuteActive)}
        >
          {isPalmMuteStart(columns, index) ? copy.tabLane.palmMute : ''}
        </div>
      ))}
    </div>
  );
}
